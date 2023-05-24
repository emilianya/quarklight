import {Loader} from "./screens/Loader";
import {LoginScreen} from "./screens/LoginScreen";
import {MainScreen} from "./screens/MainScreen";
import {useContext, useEffect} from "react";
import {AppContext} from "../contexts/AppContext";
import {lq} from "../classes/Lightquark";
import { useFlagsStatus } from '@unleash/proxy-client-react';

export const Main = () => {
	const { flagsReady, flagsError } = useFlagsStatus();
	let appContext = useContext(AppContext);
	/**
	 * Keep the Lightquark instance up to date with the token
	 */
	useEffect(() => {
		console.log("token changed, updating Lightquark instance", lq.identifier);
		console.log("token: " + appContext.token)
		lq.setToken(appContext.token);
		lq.setAppContext(appContext);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.token]);

	useEffect(() => {
		if (appContext.loading === flagsReady) return;
		appContext.setLoading(flagsReady);
		// TODO: Handle flagsError
		// TODO: lol this is so hacky please fix it
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [flagsReady, appContext.loading])

	/**
	 * Update user data when the Lightquark instance is ready
	 */
	useEffect(() => {
		if (!appContext.loggedIn || !appContext.gatewayConnected) return;
		(async () => {
			let data = await lq.apiCall("/user/me");
			if (data.request.success) {
				appContext.setUserData(data.response.jwtData);
			}
			appContext.setQuarks(await lq.getQuarks())
		})()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.gatewayConnected])

	useEffect(() => {
		if (!appContext.loggedIn) appContext.setLoading(false);
		if (appContext.loggedIn && appContext.quarks && appContext.userData && appContext.gatewayConnected) appContext.setLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.userData, appContext.loggedIn, appContext.gatewayConnected, appContext.quarks]);

	return (
		<div>
			{appContext.loading ? <Loader/> : ""}
			{!appContext.loggedIn && !appContext.loading ? <LoginScreen/> : ""}
			{appContext.loggedIn && !appContext.loading ? <MainScreen/> : ""}
		</div>
	);
}