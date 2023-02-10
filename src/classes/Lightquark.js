import wantYouGone from "../misc/wantYouGone";
let instance = null;
export default class Lightquark {
    
    token;
    baseUrl = "https://lq.litdevs.org";
    defaultVersion = "v1"
    appContext;
    ws;
    retryCount = 0;
    heartbeat;
    wygIndex = 0;
    reconnecting = false;
    dead = false;
    identifier = Math.random().toString(36).substring(7);

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
    }

    setAppContext (appContext) {
        this.appContext = appContext;
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
            /*let data = JSON.parse(message.data);
            if(data.eventId == "messageCreate") {
                console.log(data);
                if(data.message.channelId == currentChannel) { // render the message if it's in the current channel
                    messageRender(cleanMessage(data))
                }
                if(document.hidden || data.message.channelId != currentChannel) { // channel isn't focused
                    if(settingGet("notify")) { // user has notifications on
                        sendNotification(`${data.author.username} (#${channelBox[data.message.channelId].name}, ${channelBox[data.message.channelId].quark})`, data.message.content, true, data.author.avatarUri, function() { switchQuark(channelBox[data.message.channelId].quarkId, false);switchChannel(data.message.channelId, false) })
                        console.log(data.author, channelBox)
                    }
                }
            }*/
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
                // TODO: Replace with connection error on Loader.jsx
                this.appContext.setSpinnerText(`Gateway connection lost`);
                alert("Can't open gateway connection, either your internet connection is broken, server is down or your login is wrong");
            }
        }

        this.ws.onerror = (message) => {
            console.log(message)
        }
    }

    /**
     * Fetches user data for array of user IDs
     * @param {string[]} userIds - Array of user IDs
     * @returns {Promise<*[]>}
     */
    async inflateUserIdArray (userIds) {
        let users = [];
        let apiPromises = [];
        let tempCache = [];
        userIds.forEach(userId => {
            // Check if user is already in cache
            if (this.appContext.userCache.some(u => u._id === userId)) {
                return apiPromises.push(Promise.resolve({
                    request: {
                        success: true
                    },
                    response: {
                        user: this.appContext.userCache.find(u => u._id === userId)
                    }
                }))
            }
            // User is not in cache, make API call
            if (tempCache.some(u => u._id === userId)) return;
            tempCache.push(userId);
            apiPromises.push(this.apiCall(`/user/${userId}`));
        })
        let res = await Promise.all(apiPromises);
        res.forEach(resp => {
            if (resp.request.success) users.push(resp.response.user)
        })
        return users;
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
    }

    /**
     * Fetch the user's quarks
     * @returns {Promise<Quark[]>}
     */
    async getQuarks () {
        let res = await this.apiCall("/quark/me")
        let quarks = res.response.quarks;
        for (const quark in quarks) {
            quarks[quark].members = await this.inflateUserIdArray(quarks[quark].members);
        }
        return res.response.quarks
    }

    /**
     * Get user information by ID
     */
    async getUser (id) {
        let res = await this.apiCall(`/user/${id}`)
        return res.response.user
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
                "Authorization": `Bearer ${this.token}`
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
}

const lq = new Lightquark()

export {lq}