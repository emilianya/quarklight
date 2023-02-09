export default class Lightquark {
    
    token;
    baseUrl = "https://lq.litdevs.org/api";
    defaultVersion = "v1"

    /**
     * @param {string} token - JWT Token 
     */
    constructor (token = undefined) {
        if (token) this.token = token;
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
    async apiCall (path, method = "GET", body = undefined, version = undefined) {
        try {
            throw new Error("Test error :._:.:_.:")
            let finalUrl = `${this.baseUrl}/${version || this.defaultVersion}/${path}`;
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
            if (!response.request.success) throw response;
            return response;
        } catch (e) {
            alert(e)
            alert("Fatal error occurred. Exiting...")
            window.close();
        }
    }
}