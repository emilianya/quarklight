import {useEffect, useContext} from "react";
import {AppContext} from "../contexts/AppContext";
const delay = ms => new Promise(res => setTimeout(res, ms));

export function MainScreen(props) {
	let appContext = useContext(AppContext);
	useEffect(() => {
		async function getUserData() {
			let res = await fetch("https://lq.litdevs.org/v1/user/me", {
				headers: {
					"Authorization": `Bearer ${appContext.token}`
				}
			})
			let data = await res.json();
			if (data.request.success) {
				appContext.setUserData(data.response.jwtData);
			}
		}
		getUserData();
	}, [appContext, appContext.token])
	return (
		<div className="screenRoot">
			<p>You are {appContext?.userData?.username || "loading..."}</p>
			<p>Your email address is {appContext?.userData?.email || "loading..."}</p>
			<button onClick={() => appContext.setLoggedIn(false)}>Loggery Outtery</button>
			<button onClick={async () => {
				appContext.setLoading(true)
				await delay(5000);
				appContext.setLoading(false)
				}}>Load for 5s</button>
		</div>
	);
}