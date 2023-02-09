import {useContext} from "react";
import {AppContext} from "../contexts/AppContext";
import {ApiContext} from "../contexts/ApiContext";
const delay = ms => new Promise(res => setTimeout(res, ms));

export function MainScreen() {
	let appContext = useContext(AppContext);
	let apiContext = useContext(ApiContext);
	return (
		<div className="screenRoot">
			<img width={"128px"} src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
			<p>You are {appContext?.userData?.username || "loading..."}</p>
			<p>Your email address is {appContext?.userData?.email || "loading..."}</p>
			<button onClick={() => apiContext.lq.logout()}>Loggery Outtery</button>
			<button onClick={() => appContext.setToken("newTokenValue")}>killtoken</button>
			<button onClick={() => console.log(apiContext.lq)}>killws</button>
			<button onClick={async () => console.log(await apiContext.lq.apiCall("/user/me"))}>Crashery :3</button>
			<button onClick={async () => {
				appContext.setLoading(true)
				await delay(5000);
				appContext.setLoading(false)
				}}>Load for 5s</button>
		</div>
	);
}