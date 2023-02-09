import wantYouGone from "../misc/wantYouGone";
let instance = null;
export default class Lightquark {
    
    token;
    baseUrl = "https://lq.litdevs.org";
    defaultVersion = "v1"
    appContext;
    apiContext;
    ws;
    retryCount = 0;
    heartbeat;
    wygIndex = 0;
    reconnecting = false;
    dead = false;
    lqSetter;

    /**
     * @param {string} token - JWT Token 
     */
    constructor (appContext, lqSetter, token = undefined) {
        console.log("Lightquark constructor called");
        if (instance) {
            console.log("Older instance found... Kerplooey!")
            instance.destroy();
        }
        instance = this;
        this.appContext = appContext;
        this.lqSetter = lqSetter;
        if (token) this.token = token;

        // If authenticated, setup websocket gateway
        if (this.token) this.openGateway();
    }

    destroy () {
        if (this.ws) this.ws.close();
        this.dead = true;
    }

    openGateway () {
        setTimeout(() => {
            if (this.dead) return;
            if (!this.token) return;
            this.lqSetter(this)
            console.log("Opening gateway connection");
            this.ws = new WebSocket("wss://lq-gateway.litdevs.org", this.token);
            this.registerWsListeners();
        }, 1000)
    }

    /**
     * Registers all websocket listeners
     */
    registerWsListeners () {
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
                console.log("Sending heartbeat", wantYouGone[this.wygIndex] )
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
            console.log(message)
        }
        this.ws.onclose = (message) => {
            if (this.heartbeat) clearInterval(this.heartbeat);
            if (this.dead) return;
            this.appContext.setGatewayConnected(false);
            this.appContext.setLoading(true);
            this.reconnecting = true;
            if (this.retryCount < 5) { // Max 5 retries
                // Try to reconnect after 1*retryCount seconds
                this.retryCount++;
                setTimeout(() => {
                    this.openGateway();
                }, 1000 * this.retryCount);
            } else {
                // TODO: Replace with connection error on Loader.jsx
                alert("Can't open gateway connection, either your internet connection is broken, server is down or your login is wrong");
            }
        }

        this.ws.onerror = (message) => {
            console.log(message)
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
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await delay(500)
        console.log(`API Call: ${method} ${path}`)
        console.log("Current state", this)
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