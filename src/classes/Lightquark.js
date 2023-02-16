import wantYouGone from "../misc/wantYouGone";
import notificationWav from "../assets/notification.wav";
import EventEmitter from "events";
import humanFileSize from "../misc/humanFileSize";
let instance = null;
export default class Lightquark {
    
    token;
    baseUrl = "https://lq.litdevs.org";
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

    /**
     * @param appContext - React Context
     * @param {string} token - JWT Token 
     */
    constructor (appContext = undefined, token = undefined) {
        console.log("Lightquark constructor called");
        if (instance) {
            console.log("Older instance found... Kerplooey!");
            instance.destroy();
        }
        instance = this;
        this.appContext = appContext;
        this.token = token;

        // If authenticated, setup websocket gateway
        if (this.token && !this.ws) this.openGateway();

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
                    break;
                case "quarkDelete":
                    break;
                case "channelCreate":
                    break;
                case "channelUpdate":
                    break;
                case "channelDelete":
                    break;
                case "memberUpdate":
                    break;
                case "memberLeave":
                    break;
                case "memberJoin":
                    break;
                case "subscribe":
                    break;
                case "heartbeat":
                    break;
                default:
                    console.log("Unknown event", event)
                    break;
            }
        })
    }


    async messageParser(data) {
        data.message.attachments = await Promise.all(data.message.attachments.map(async attachment => {
            let res = await fetch(attachment, {
                method: "HEAD",
                headers: {
                    Range: "bytes=0-0",
                }
            })
            let newAttachment = { url: attachment }
            let fileSize = humanFileSize(res.headers.get("content-range").split("/")[1].replace(/"/g, ""));
            newAttachment.size = fileSize;
            newAttachment.name = res.headers.get("content-disposition").split("filename=")[1].replace(/"/g, "");
            newAttachment.type = res.headers.get("content-type");
            return newAttachment;
        }))
        return data;
    }

    async messageUpdate (data) {
        if(data.message.channelId === this.mainContext.selectedChannel) { // render the message if it's in the current channel
            data.author = await this.getUser(data.message.authorId)
            let parsedMessage = await this.messageParser(data)
            let filteredMessages = this.messageState.messages.filter(message => message.message._id !== data.message._id)
            filteredMessages.push(parsedMessage)
            this.messageState.setMessages(filteredMessages)
        }
    }


    async messageCreate (data) {
        if(data.eventId === "messageCreate") { // Redundant check due to old setup, too scared to remove it
            if(data.message.channelId === this.mainContext.selectedChannel) { // render the message if it's in the current channel
                let parsedMessage = await this.messageParser(data)
                this.messageState.setMessages(prev => [...prev, parsedMessage])
            }
            if((document.hidden || data.message.channelId !== this.mainContext.selectedChannel) && data.author._id !== this.appContext.userData._id) { // channel isn't focused
                this.mainContext.setUnreadChannels(prev => {
                    if(!prev.includes(data.message.channelId)) {
                        return [...prev, data.message.channelId]
                    }
                    return prev;
                })
                let notificationAudio = new Audio(notificationWav);
                try {
                    notificationAudio.play();
                    new Notification(`${data.author.username} in #${(await this.getChannel(data.message.channelId)).name}`, {body: data.message.content || "Attachment", tag: "quarklight", icon: data.author.avatarUri})
                } catch (e) {
                    console.log("Failed to play notification sound", e);
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
        if (this.token && !this.ws) this.openGateway();
    }

    destroy () {
        console.log("destroy called")
        if (this.ws) this.ws.close();
        this.dead = true;
    }

    openGateway () {
        console.log("open gateway called")
        if (this.dead) return;
        if (!this.token) return;
        console.log("Opening gateway connection");
        this.ws = new WebSocket("wss://lq-gateway.litdevs.org", this.token);
        this.registerWsListeners();
    }

    /**
     * Registers all websocket listeners
     */
    registerWsListeners () {
        console.log("register ws listeners called", this.identifier)
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
                console.log("Sending heartbeat", wantYouGone[this.wygIndex], this.identifier )
                this.ws.send(JSON.stringify({event: "heartbeat", message: wantYouGone[this.wygIndex]}))
                this.wygIndex += 1;
                if(this.wygIndex === wantYouGone.length - 1) this.wygIndex = 0;
            }, 15000);
        }
        this.ws.onmessage = (message) => {
            let data = JSON.parse(message.data);
            this.eventBus.emit("gatewayEvent", data);
            console.log(message);
        }
        this.ws.onclose = (message) => {
            console.log(message.code, message.reason)
            console.log(message.wasClean ? "Gateway connection closed" : "Gateway connection lost")
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
            console.log(message)
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
        await lq.apiCall(`/channel/${channelId}/messages`, "POST", {content: message, attachments, specialAttributes}, "v2");
    }

    async deleteMessage(messageId, channelId) {
        await lq.apiCall(`/channel/${channelId}/messages/${messageId}`, "DELETE");
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
            console.log("after Leaving", newQuarks)
        } else {
            console.error("Failed to leave quark", res);
        }
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
        return res.response.quarks
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
            console.log(e)
            alert(e)
            alert("Fatal error occurred. Exiting...")
            window.close();
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
        let res = await this.apiCall(`/channel/${channelId}/messages${startTimestamp ? `?startTimestamp=${startTimestamp}` : ""}`)
        return await Promise.all(res.response.messages.map(async m => await this.messageParser(m)));
    }
}

const lq = new Lightquark()

export {lq}