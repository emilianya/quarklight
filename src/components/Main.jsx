import {Loader} from "./Loader";
import {LoginScreen} from "./LoginScreen";
import {MainScreen} from "./MainScreen";
import {useContext, useEffect, useState} from "react";
import Lightquark from "../classes/Lightquark";
import {AppContext} from "../contexts/AppContext";
import {ApiContext} from "../contexts/ApiContext";


export const Main = () => {
	let appContext = useContext(AppContext);
	let [lq, setLq] = useState(new Lightquark(appContext, () => {}, appContext.token));
	let [ws, setWs] = useState(null);
	/**
	 * Keep the Lightquark instance up to date with the token
	 */
	useEffect(() => {
		console.log("token changed, creating new Lightquark instance");
		console.log("token: " + appContext.token)
		setLq(new Lightquark(appContext, setLq, appContext.token));
	}, [appContext.token]);

	/**
	 * Update user data when the Lightquark instance is ready
	 */
	useEffect(() => {
		if (!appContext.loggedIn) return;
		(async () => {
			let data = await lq.apiCall("/user/me");
			if (data.request.success) {
				appContext.setUserData(data.response.jwtData);
			}
		})()
	}, [appContext.gatewayConnected])

	useEffect(() => {
		if (!appContext.loggedIn) appContext.setLoading(false);
		console.log("loggedIn: " + appContext.loggedIn)
		console.log("userData: " + appContext.userData)
		console.log("appContext.gatewayConnected: " + appContext.gatewayConnected)
		if (appContext.loggedIn && appContext.userData && appContext.gatewayConnected) appContext.setLoading(false);
	}, [appContext.userData, appContext.loggedIn, appContext.gatewayConnected]);

	return (
		<ApiContext.Provider value={{lq, setLq}}>
			<div>
				{appContext.loading ? <Loader/> : ""}
				{!appContext.loggedIn && !appContext.loading ? <LoginScreen/> : ""}
				{appContext.loggedIn && !appContext.loading ? <MainScreen/> : ""}
			</div>
		</ApiContext.Provider>
	);
}