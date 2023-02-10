import {Loader} from "./Loader";
import {LoginScreen} from "./LoginScreen";
import {MainScreen} from "./MainScreen";
import {useContext, useEffect} from "react";
import {AppContext} from "../contexts/AppContext";
import {lq} from "../classes/Lightquark";

export const Main = () => {
	let appContext = useContext(AppContext);
	/**
	 * Keep the Lightquark instance up to date with the token
	 */
	useEffect(() => {
		console.log("token changed, updating Lightquark instance", lq.identifier);
		console.log("token: " + appContext.token)
		lq.setToken(appContext.token);
		lq.setAppContext(appContext);
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
		if (appContext.loggedIn && appContext.userData && appContext.gatewayConnected) appContext.setLoading(false);
	}, [appContext.userData, appContext.loggedIn, appContext.gatewayConnected]);

	return (
		<div>
			{appContext.loading ? <Loader/> : ""}
			{!appContext.loggedIn && !appContext.loading ? <LoginScreen/> : ""}
			{appContext.loggedIn && !appContext.loading ? <MainScreen/> : ""}
		</div>
	);
}