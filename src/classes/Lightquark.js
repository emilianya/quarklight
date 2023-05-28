import wantYouGone from "../misc/wantYouGone";
import notificationMP3 from "../assets/notification.mp3";
import EventEmitter from "events";
import humanFileSize from "../misc/humanFileSize";
import * as linkify from 'linkifyjs';
import settings from "./Settings";

export default class Lightquark {
    
    token;
    baseUrl = "https://lq.litdevs.org";
    gatewayUrl = "wss://lq-gateway.litdevs.org";
    defaultVersion = "v1"
    appContext;
    mainContext;
    ws;
    retryCount = 0;
    heartbeat;
    wygIndex = 0;
    reconnecting = false;
    dead = false;
    identifier = Math.random().toString(36).substring(7);
    messageState;
    eventBus = new EventEmitter();
    isDev = false;
    pendingWarning = undefined;
    initalized = false;

    /**
     * @param networkRoot - Root URL of the network, e.g. https://lq.litdevs.org
     * @param appContext - React Context
     * @param {string} token - JWT Token 
     */
    constructor(networkRoot, appContext = undefined, token = undefined) {
        console.log("Lightquark constructor called");
        if (Lightquark._instance) {
            console.log("Existing instance of Lightquark found, returning that instance");
            return Lightquark._instance;
        }
        console.warn("Creating new instance of Lightquark")
        Lightquark._instance = this;
        this.appContext = appContext;
        this.token = token;

        try {
            let parsedNetworkRoot;
            if (networkRoot.startsWith("http://") || networkRoot.startsWith("https://")) {
                parsedNetworkRoot = networkRoot;
            } else {
                parsedNetworkRoot = `https://${networkRoot}`;
            }
            fetch(`${parsedNetworkRoot}/v1/network`).then(res => res.json()).then(networkData => {
                console.log("Network data:", networkData);
                this.baseUrl = networkData.baseUrl;
                this.gatewayUrl = networkData.gateway;

                // If authenticated, setup websocket gateway
                if (this.token && !this.ws) this.openGateway();
                this.initalized = true;
            }).catch(err => {
                alert("Failed to connect to network. Defaulting to lq.litdevs.org");
                settings.settings.ql_network = "lq.litdevs.org";
                window.location.reload();
            })
        } catch {
            console.error("Failed to fetch network data");
            this.appContext.setSpinnerText("Failed to fetch network data");
        }

        this.eventBus.on("gatewayEvent", (event) => {
            switch (event.eventId) {
                case "messageCreate":
                    this.messageCreate(event);
                    break;
                case "messageUpdate":
                    this.messageUpdate(event);
                    break;
                case "messageDelete":
                    this.messageState.setMessages(this.messageState.messages.filter(message => message.message._id !== event.message._id));
                    break;
                case "quarkUpdate":
                    this.getQuark(event.quark._id).then(updatedQuark => {
                        this.appContext.setQuarks(prev => {
                            let quarks = prev.filter(quark => quark._id !== event.quark._id);
                            quarks.push(updatedQuark);
                            quarks.sort((a, b) => {
                                // Sort based on quark order
                                let aOrder = this.mainContext.quarkOrder.indexOf(a._id);
                                let bOrder = this.mainContext.quarkOrder.indexOf(b._id);
                                return aOrder - bOrder;
                            })
                            return quarks;
                        });
                    })
                    break;
                case "quarkDelete":
                    this.appContext.setQuarks(p => p.filter(quark => quark._id !== event.quark._id));
                    if (this.mainContext.selectedQuark === event.quark._id) {
                        if (this.appContext.quarks[0]._id === event.quark._id) {
                            this.mainContext.setSelectedQuark(undefined);
                        } else {
                            this.mainContext.setSelectedQuark(this.appContext.quarks[0]._id);
                        }
                    }
                    break;
                case "channelCreate":
                    this.appContext.setChannelCache(prev => [...prev, {cachedAt: new Date(), channel: event.channel}]);
                    if (event.channel.quark === this.mainContext.selectedQuark) {
                        this.appContext.setChannels(prev => [...prev, event.channel]);
                    }
                    break;
                case "channelUpdate":
                    let channelCache = this.appContext.channelCache;
                    channelCache = channelCache.filter(channel => channel.channel._id !== event.channel._id);
                    channelCache.push({cachedAt: new Date(), channel: event.channel});
                    this.appContext.setChannelCache(channelCache);
                    if (event.channel.quark === this.mainContext.selectedQuark) {
                        this.appContext.setChannels(prev => {
                            let channels = prev.filter(channel => channel._id !== event.channel._id);
                            channels.push(event.channel);
                            return channels;
                        })
                    }
                    break;
                case "channelDelete":
                    this.appContext.setChannelCache(prev => prev.filter(channel => channel.channel._id !== event.channel._id));
                    this.appContext.setChannels(prev => prev.filter(channel => channel._id !== event.channel._id));
                    break;
                case "memberUpdate":
                    break;
                case "memberLeave":
                    break;
                case "memberJoin":
                    break;
                case "quarkOrderUpdate":
                    this.mainContext.setQuarkOrder(event.order);
                    break;
                case "nicknameUpdate":
                    if (event.scope === "global") {
                        this.mainContext.setNickname(event.nickname);
                        (async () => {
                            this.mainContext.setQuarkNickname(await this.getNickname(this.mainContext.selectedQuark));
                        })()
                    } else {
                        if (event.scope === this.mainContext.selectedQuark) {
                            this.mainContext.setQuarkNickname(event.nickname);
                        }
                    }
                    break;
                case "subscribe":
                    break;
                case "heartbeat":
                    break;
                default:
                    console.warn("Unknown event", event)
                    break;
            }
        })
    }


    async messageParser(data) {
        data.message.attachments = await Promise.all(data.message.attachments.map(async attachment => {
            let cachedAttachment = this.appContext.attachmentCache.find(a => a.url === attachment);
            if (cachedAttachment && (Date.now() - cachedAttachment.cachedAt < 60 * 60 * 1000) ) {
                console.log("Using cached attachment")
                return cachedAttachment.attachment;
            }
            console.warn("Fetching attachment");
            let res = await fetch(attachment, {
                method: "HEAD",
                headers: {
                    Range: "bytes=0-0",
                }
            })
            let newAttachment = { url: attachment }
            newAttachment.size = humanFileSize(res.headers.get("content-range").split("/")[1].replace(/"/g, ""));
            newAttachment.name = res.headers.get("content-disposition").split("filename=")[1].replace(/"/g, "");
            newAttachment.type = res.headers.get("content-type");

            this.appContext.setAttachmentCache(prev => [...prev, {url: attachment, cachedAt: Date.now(), attachment: newAttachment}]);
            return newAttachment;
        }))
        const reply = data.message.specialAttributes.find(a => a.type === "reply");
        if (reply) {
            data.message.reply = await this.fetchMessage(data.message.channelId, reply.replyTo);
            if (!data.message.reply) {
                data.message.reply = {
                    message: {
                        content: "This message is deleted",
                        authorId: "0",
                        channelId: data.message.channelId,
                        _id: reply.replyTo,
                        attachments: [],
                        specialAttributes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    author: {
                        username: "Deleted message",
                        _id: "0",
                        avatar: null,
                    }
                }
            }
        }

        data.message.original = data.message.content;
        let clientAttributes = data.message.specialAttributes.find(a => a.type === "clientAttributes");
        if (clientAttributes && clientAttributes?.plaintext) {
            data.message.modified = data.message.content === clientAttributes.plaintext;
            data.message.original = clientAttributes.plaintext;
        }
        data.message.cat = !!clientAttributes?.isCat;
        return data;
    }

    async messageUpdate (data) {
        if(data.message.channelId === this.mainContext.selectedChannel) { // render the message if it's in the current channel
            if (!data.author) data.author = await this.getUser(data.message.authorId);
            let parsedMessage = await this.messageParser(data);
            let filteredMessages = this.messageState.messages.filter(message => message.message._id !== data.message._id);
            filteredMessages.push(parsedMessage);
            this.messageState.setMessages(filteredMessages);
        }
    }

    /**
     * Get a message by ID
     * @param channelId
     * @param messageId
     * @returns {Promise<Message|undefined>}
     */
    async fetchMessage (channelId, messageId) {
        let existingMessage = this.messageState.messages.find(message => message.message._id === messageId);
        if (existingMessage) return existingMessage;
        let res = await this.apiCall(`/channel/${channelId}/messages/${messageId}`, "GET", undefined, "v2");
        if (res.request.success) return res.response.data;
        return undefined;
    }

    async messageCreate (data) {
        if(data.eventId === "messageCreate") { // Redundant check due to old setup, too scared to remove it
            if(data.message.channelId === this.mainContext.selectedChannel) { // render the message if it's in the current channel
                let parsedMessage = await this.messageParser(data)
                console.log(parsedMessage)
                this.messageState.setMessages(prev => [...prev, parsedMessage])
            }
            if((document.hidden || data.message.channelId !== this.mainContext.selectedChannel)
                && data.author._id !== this.appContext.userData._id
                && !this.appContext.preferences.mutedChannels.includes(data.message.channelId)) { // channel isn't focused
                this.mainContext.setUnreadChannels(prev => {
                    if(!prev.includes(data.message.channelId)) {
                        return [...prev, data.message.channelId]
                    }
                    return prev;
                })
                if (this.appContext.preferences.notificationsEnabled) {
                    let notificationAudio = new Audio(notificationMP3);
                    console.log(notificationAudio.volume)
                    notificationAudio.volume = this.appContext.preferences.ql_notificationVolume
                    console.log(notificationAudio.volume)
                    try {
                        let sound = notificationAudio.play();
                        let username = data.author.username;
                        let avatar = data.author.avatarUri;
                        if (data.message.specialAttributes.some(attr => attr.type === "botMessage")) {
                            username = data.message.specialAttributes.find(attr => attr.type === "botMessage").username
                            avatar = data.message.specialAttributes.find(attr => attr.type === "botMessage").avatarUri
                        }
                        let n = new Notification(`${username} in #${(await this.getChannel(data.message.channelId)).name}`, {body: data.message.content || "Attachment", tag: "quarklight", icon: avatar, silent: true})
                        await sound;
                        n.onclick = () => {
                            let quarkId = this.appContext.quarks.find(quark => quark.channels.some(channel => channel._id === data.message.channelId))._id
                            let channelId = data.message.channelId
                            let messageId = data.message._id
                            this.openLqLink(`lightquark://${quarkId}/${channelId}/${messageId}`)
                        }
                    } catch (e) {
                        console.log("Failed to play notification sound", e);
                    }
                }
            }
        }
    }

    setMessageState (messageState) {
        this.messageState = messageState;
    }

    setAppContext (appContext) {
        this.appContext = appContext;
    }

    setMainContext (mainContext) {
        this.mainContext = mainContext;
    }

    setToken (token) {
        console.log("token updated", this.identifier)
        this.token = token;
        if (this.token && !this.ws && this.initalized) this.openGateway();
    }

    openGateway () {
        console.warn("open gateway called", this.gatewayUrl);
        if (this.dead) return;
        if (!this.token) return;
        console.log("Opening gateway connection");
        this.ws = new WebSocket(this.gatewayUrl, this.token);
        this.registerWsListeners();
    }

    /**
     * Registers all websocket listeners
     */
    registerWsListeners () {
        console.log("WS listeners registered for", this.identifier)
        this.ws.onopen = () => {
            this.retryCount = 0; // Connection open, reset retry counter
            if (this.reconnecting) {
                this.reconnecting = false;
                this.appContext.setLoading(false);
            }
            this.appContext.setGatewayConnected(true);
            if(this.heartbeat) clearInterval(this.heartbeat); // Clear heartbeat if it's already running
            // Send heartbeat to server every 15 seconds
            this.heartbeat = setInterval(() => {
                console.debug("Sending heartbeat", wantYouGone[this.wygIndex], this.identifier )
                this.ws.send(JSON.stringify({event: "heartbeat", message: wantYouGone[this.wygIndex]}))
                this.wygIndex += 1;
                if(this.wygIndex === wantYouGone.length - 1) this.wygIndex = 0;
            }, 15000);
            // subscribe to user updates
            this.ws.send(JSON.stringify({event: "subscribe", message: "me"}))
        }
        this.ws.onmessage = (message) => {
            let data = JSON.parse(message.data);
            this.eventBus.emit("gatewayEvent", data);
            console.debug(message);
        }
        this.ws.onclose = (message) => {
            console.warn(message.code, message.reason)
            console.warn(message.wasClean ? "Gateway connection closed" : "Gateway connection lost")
            if (this.heartbeat) clearInterval(this.heartbeat);
            if (this.dead) return;
            
            // Make it very clear to everything that the gateway is disconnected
            this.appContext.setGatewayConnected(false);
            this.appContext.setLoading(true);
            this.appContext.setSpinnerText("Reconnecting to gateway...");
            this.reconnecting = true;

            if (this.retryCount < 5) { // Max 5 retries
                // Try to reconnect after 1*retryCount seconds
                this.retryCount++;
                this.appContext.setSpinnerText(`Gateway connection lost... Reconnecting in ${this.retryCount} seconds.`);
                setTimeout(() => {
                    console.log("Retrying gateway connection", this.identifier)
                    this.openGateway();
                }, 1000 * this.retryCount);
            } else {
                this.appContext.setSpinnerText(`Gateway connection lost`);
            }
        }

        this.ws.onerror = (message) => {
            console.error(message)
        }
    }

    /**
     * Sends a message to a channel
     * @param message{string} - Message content
     * @param attachments{{filename: string, data: string}[]} - Array of attachments, data in base64
     * @param channelId - Channel ID
     * @param replyTo - Message ID to reply to
     * @returns {Promise<void>} - Resolves when api call is complete
     */
    async sendMessage(message, attachments, channelId, replyTo = null) {
        let specialAttributes = [];
        if(replyTo) specialAttributes.push({type: "reply", replyTo: replyTo});
        let clientAttributes = { type: "clientAttributes" };
        clientAttributes.plaintext = message;

        // Perform text modifiers/other client attributes
        if (this.appContext.preferences.ql_cat) {
            clientAttributes.isCat = true;
            // Replace no with nyo, na with nya. Do not affect links
            let words = message.split(" ");
            words.forEach((word, index) => {
                let isLink = linkify.test(word);
                if (!isLink) {
                    word = word.replace(/no/g, "nyo");
                    word = word.replace(/na/g, "nya");
                    word = word.replace(/ma/g, "mya");
                }
                console.log(isLink)
                words[index] = word;
            })
            message = words.join(" ");
        }

        specialAttributes.push(clientAttributes);
        await lq.apiCall(`/channel/${channelId}/messages`, "POST", {content: message, attachments, specialAttributes}, "v2");
    }

    /**
     * Edits a message
     * @param messageId
     * @param channelId
     * @param message New content
     * @returns {Promise<void>}
     */
    async editMessage(messageId, channelId, message) {
        await lq.apiCall(`/channel/${channelId}/messages/${messageId}`, "PATCH", {content: message}, "v2");
    }

    async deleteMessage(messageId, channelId) {
        await lq.apiCall(`/channel/${channelId}/messages/${messageId}`, "DELETE");
    }

    async getNickname(quarkId = null) {
        let res = await lq.apiCall(`/user/me/nick/${quarkId || "global"}`, "GET", null, "v2");
        if (res.request.success) return res.response.nickname;
        else return null;
    }

    async setNickname(nickname, scope) {
        let res = await lq.apiCall(`/user/me/nick`, "PUT", {nickname, scope}, "v2");
        return res.request.success ? false : res.response.message;
    }

    /**
     * Subscribes to gateway updates for a channel
     * @param channelId
     */
    subscribeToChannel (channelId) {
        this.ws.send(JSON.stringify({event: "subscribe", message: `channel_${channelId}`}))
    }

    /**
     * Subscribes to gateway updates for a quark
     * @param quarkId
     */
    subscribeToQuark (quarkId) {
        this.ws.send(JSON.stringify({event: "subscribe", message: `quark_${quarkId}`}))
    }

    /**
     * Fetches user data for array of user IDs
     * @param {string[]} userIds - Array of user IDs
     * @returns {Promise<*[]>}
     */
    async inflateUserIdArray (userIds) {
        let apiPromises = [];
        let tempCache = [];
        userIds.forEach(userId => {
            if (tempCache.some(u => u._id === userId)) return;
            tempCache.push(userId);
            apiPromises.push(this.getUser(userId));
        });
        let res = await Promise.all(apiPromises);
        return res;
    }

    /**
     * Checks if an invite code is valid
     * 
     * @param {string} inviteCode 
     * @returns {Promise<{valid: boolean, quark?: Quark}>} 
     */
    async checkInvite (inviteCode) {
        let res = await this.apiCall(`/quark/invite/${inviteCode}`);
        return {
            valid: res.request.success,
            alreadyMember: this.appContext.quarks.some(q => q._id === res.response?.quark?._id) || false,
            quark: res.response.quark || undefined
        }
    }

    /**
     * Joins a quark using an invite code
     * @param inviteCode
     * @returns {Promise<void>}
    */
    async joinQuark (inviteCode) {
        let res = await this.apiCall(`/quark/invite/${inviteCode}`, "POST");
        let newQuark = await this.getQuark(res.response.quark._id);
        this.appContext.setQuarks(o => [...o, newQuark]); // Get full quark data
    }

    async leaveQuark (quarkId) {
        let res = await this.apiCall(`/quark/${quarkId}/leave`, "POST");
        if (res.request.success) {
            let newQuarks = this.appContext.quarks.filter(q => q._id !== quarkId);
            this.appContext.setQuarks(newQuarks);
        } else {
            console.error("Failed to leave quark", res);
        }
    }

    async createQuark (name) {
        let res = await this.apiCall("/quark/create", "POST", {name});
        if (res.request.success) {
            let newQuark = await this.getQuark(res.response.quark._id);
            // TODO: Remove this with QUARKLIGHT-47
            this.appContext.setQuarks(o => [...o, newQuark]);
            this.subscribeToQuark(newQuark._id)
            newQuark.channels.forEach(c => this.subscribeToChannel(c._id));
            return {error: false, quark: newQuark};
        } else {
            console.error("Failed to create quark", res);
            return {error: res.response.error};
        }
    }

    async deleteQuark (quarkId) {
        return await this.apiCall(`/quark/${quarkId}`, "DELETE");
        /*if (res.request.success) {
            let newQuarks = this.appContext.quarks.filter(q => q._id !== quarkId);
            this.appContext.setQuarks(newQuarks);
        } else {
            console.error("Failed to delete quark", res);
        }*/
    }

    /**
     * Logs in to Lightquark
     * @param email
     * @param password
     * @returns {Promise<Response<unknown>>}
     */
    async login (email, password) {
        return await this.apiCall("/auth/token", "POST", {email, password})
    }

    /**
     * Logs out of Lightquark
     * @returns {Promise<void>}
     */
    async logout () {
        this.appContext.setToken(undefined);
        this.appContext.setLoggedIn(false);
        this.appContext.setUserData(undefined);
        window.location.reload();
    }

    /**
     * Fetch the user's quarks
     * @returns {Promise<Quark[]>}
     */
    async getQuarks () {
        let res = await this.apiCall("/quark/me", "GET", undefined, "v2")
        let quarks = res.response.quarks;
        for (const quark in quarks) {
            //quarks[quark].members = await this.inflateUserIdArray(quarks[quark].members); Perhaps dont do that...
            quarks[quark].channels.forEach(channel => {
                this.subscribeToChannel(channel._id);
                this.appContext.setChannelCache(prevState => [...prevState, {channel, cachedAt: new Date()}]);
            })
            this.subscribeToQuark(quarks[quark]._id);
        }
        let order = await this.apiCall("/quark/order", "GET", undefined, "v2");
        let orderedQuarks = [];
        order.response.order.forEach(quarkId => {
            orderedQuarks.push(quarks.find(q => q._id === quarkId));
        })
        if (this.mainContext) this.mainContext.setQuarkOrder(order.response.order);
        return orderedQuarks;
    }

    async updateQuarkOrder () {
        let order = await this.apiCall("/quark/order", "GET", undefined, "v2");
        if (this.mainContext) this.mainContext.setQuarkOrder(order.response.order);
        return order.response.order
    }

    async getQuark (quarkId) {
        let res = await this.apiCall(`/quark/${quarkId}`)
        let quark = res.response.quark;
        quark.members = await this.inflateUserIdArray(quark.members);
        return quark;
    }

    /**
     * Get channels in a quark
     * @param quarkId
     * @returns {Promise<Channel[]>}
     */
    async getChannels (quarkId) {
        let quark = this.appContext.quarks.find(q => q._id === quarkId);
        let channelPromises = [];
        quark.channels.forEach(channel => {
            channelPromises.push(this.getChannel(channel._id));
        })
        let res = await Promise.all(channelPromises);
        return res;
    }

    /**
     * Get channel by ID
     * @param channelId
     * @returns {Promise<Channel>}
     */
    async getChannel (channelId) {
        let cachedChannel = this.appContext.channelCache.find(c => c.channel._id === channelId);
        const getFromApi = async () => {
            let res = await this.apiCall(`/channel/${channelId}`)
            this.appContext.setChannelCache([...this.appContext.channelCache, {channel: res.response.channel, cachedAt: new Date()}])
            return res.response.channel
        }

        if (!cachedChannel) {
            return await getFromApi();
        } else {
            // Check if channel is cached for more than 5 minutes
            if (new Date() - cachedChannel.cachedAt > 1000 * 60 * 5) {
                this.appContext.setChannelCache(this.appContext.channelCache.filter(c => c.channel._id !== channelId));
                return await getFromApi();
            }
            return cachedChannel.channel;
        }
    }

    /**
     * Create a channel in a quark
     * @param name
     * @param quarkId
     * @returns {Promise<{error}|{channel: Channel, error: boolean}>}
     */
    async createChannel (name, quarkId) {
        let res = await this.apiCall("/channel/create", "POST", {name, quark: quarkId});
        if (res.request.success) {
            let newChannel = await this.getChannel(res.response.channel._id);
            //let quarks = this.appContext.quarks;
            //let quark = quarks.find(q => q._id === quarkId);
            //quark.channels.push(newChannel);
            //this.appContext.setQuarks(quarks);
            //this.appContext.setChannels(prevState => [...prevState, newChannel])
            return {error: false, channel: newChannel};
        } else {
            console.error("Failed to create channel", res);
            return {error: res.response.error};
        }
    }

    /**
     * Update a channel
     * @param name
     * @param description
     * @param channelId
     * @returns {Promise<{error}|{channel: Channel, error: boolean}>}
     */
    async updateChannel (name, description, channelId) {
        let res = await this.apiCall(`/channel/${channelId}`, "PATCH", {name, description});
        if (res.request.success) {
            let newChannel = res.response.channel;
            let channels = this.appContext.channels;
            let channel = channels.find(c => c._id === channelId);
            channel.name = newChannel.name;
            channel.description = newChannel.description;
            this.appContext.setChannels(channels);
            return {error: false, channel: newChannel};
        } else {
            console.error("Failed to update channel", res);
            return {error: res.response.error};
        }
    }

    /**
     * Delete a channel
     * @param channelId
     * @returns {Promise<void>}
     */
    async deleteChannel (channelId) {
        let channel = await this.getChannel(channelId);
        let res = await this.apiCall(`/channel/${channelId}`, "DELETE");
        if (res.request.success) {
            await this.updateQuark(channel.quark);
            if (this.mainContext.selectedChannel === channel._id) this.mainContext.setSelectedChannel(null);
        } else {
            console.error("Failed to delete channel", res);
        }
    }

    async updateQuark (quarkId) {
        console.log("Updating quark", quarkId)
        let quark = await this.getQuark(quarkId);
        let quarks = this.appContext.quarks.filter(q => q._id !== quarkId);
        this.appContext.setQuarks([...quarks, quark]);
        this.appContext.setChannels(quark.channels);
        console.log("Updated quark", quark)
    }

    async editQuark (quarkId, name, invite) {
        let isInviteChanged = this.appContext.quarks.find(q => q._id === quarkId).invite !== invite;
        let isNameChanged = this.appContext.quarks.find(q => q._id === quarkId).name !== name;
        let requestBody = {};
        if (isInviteChanged) requestBody.invite = invite;
        if (isNameChanged) requestBody.name = name;
        if (!isInviteChanged && !isNameChanged) return false;
        return await this.apiCall(`/quark/${quarkId}`, "PATCH", requestBody);
    }

    /**
     * Get user information by ID
     */
    async getUser (id) {
        // check cache for a recent instance of the user
        let cachedUser = this.appContext.userCache.find(u => u._id === id);
        const getFromApi = async () => {
            let res = await this.apiCall(`/user/${id}`)
            this.appContext.setUserCache([...this.appContext.userCache, {user: res.response.user, cachedAt: new Date()}])
            return res.response.user
        }
        if (!cachedUser) {
            return await getFromApi();
        } else {
            // Check if user is cached for more than 5 minutes
            if (new Date() - cachedUser.cachedAt > 1000 * 60 * 5) {
                return await getFromApi();
            }
            return cachedUser.user;
        }
    }

    /**
     * Makes an API call to the Lightquark API
     * 
     * @param {string} path 
     * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"OPTIONS"|"HEAD"} method 
     * @param {object} body 
     * @param {"v1"|"v2"} version - API Version, defaults to v1
     * @returns {Promise<Response>} - Returns promise or throws error
     */
    async apiCall (path, method = "GET", body = undefined, version = undefined, no401Check = false) {
        console.log(`API Call: ${method} ${path}`)
        try {
            let finalUrl = `${this.baseUrl}/${version || this.defaultVersion}${path}`;
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`,
                "lq-agent": `Quarklight ${navigator.userAgent.includes("Electron") ? "" : "Web "}${this?.appContext?.version?.split("-")?.[0] || "0.0.0"}`
            };
            let options = {
                method: method,
                headers: headers,
                body: body ? JSON.stringify(body) : undefined
            };

            let response = await (await fetch(finalUrl, options)).json();
            if (response.request.status_code === 401 && !no401Check) {
                let tokenValid = await this.verifyToken();
                if (!tokenValid) {
                    this.appContext.setLoggedIn(false);
                    this.appContext.setToken(undefined);
                }
            }
            return response;
        } catch (e) {
            // TODO: Figure out something better than this
            console.error(e)
            if (this.mainContext) this.mainContext.setWarning({
                message: "An error occurred while trying to connect to Lightquark",
                severityColor: "#F79824",
                severity: "WARNING"
            });
        }
    }

    /**
     * Verifies the token
     * @returns {Promise<boolean>} - Is the token valid?
     */
    async verifyToken() {
        let response = await this.apiCall("/user/me", "GET", undefined, undefined, true);
        return response.request.status_code === 200;
    }

    /**
     * Get messages from a channel
     * @param {string} channelId - ID of the channel
     * @param {number} startTimestamp - Timestamp to start from
     * @returns {Promise<Message[]>}
     */
    async getMessages (channelId, startTimestamp = undefined) {
        if (!channelId) return [];
        let res = await this.apiCall(`/channel/${channelId}/messages${startTimestamp ? `?startTimestamp=${startTimestamp}` : ""}`, "GET", undefined, "v2")
        return await Promise.all(res.response.messages.map(async m => await this.messageParser(m)));
    }

    async setAvatar(avatarBin, mime) {
        try {
            let res = await fetch(`${this.baseUrl}/v1/user/me/avatar`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": mime
                },
                body: avatarBin
            })
            let json = await res.json();
            return !json.request.success;
        } catch (e) {
            console.error(e);
            this.mainContext.setWarning({
                message: "An error occurred while trying to upload your avatar",
                severityColor: "#F79824",
                severity: "NORMAL"
            })
            return "Error uploading";
        }
    }

    updateAvailable(releaseName, callback) {
        this.mainContext.setWarning({
            message: `Update available (${releaseName}) Click here to install.`,
            severityColor: "#24f760",
            severity: "INFO",
            onClick: callback,
            dontDismissOnClick: false
        })
    }

    /**
     * Open a lightquark:// protocol link
     * @param {string} link 
     * @returns {Promise<boolean>} Was the link opened?
     */
    async openLqLink (link) {
        // TODO: scroll to message

        // lightquark://{quarkId}/{channelId?}/{messageId?}
        // lightquark://638b815b4d55b470d9d6fa1a/63eb7cc7ecc96ed5edc267f
        let linkParts = link.split("://")[1].split("/");
        let quarkId = linkParts[0];
        let channelId = linkParts?.[1];
        let messageId = linkParts?.[2];
        console.log(quarkId, channelId, messageId)
        if (this.appContext.quarks.some(q => q._id === quarkId)) {
            this.mainContext.setSelectedQuark(quarkId);
            if (channelId) {
                this.mainContext.setSelectedChannel(channelId);
            }
            return true;
        } else {
            return false;
        }
    }
}


const lq = new Lightquark(settings.settings.ql_network);

export {lq}