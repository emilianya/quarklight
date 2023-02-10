import {useContext, useState} from "react";
import {AppContext} from "../contexts/AppContext";
import { lq } from "../classes/Lightquark";
const delay = ms => new Promise(res => setTimeout(res, ms));

export function MainScreen() {
	let [quarks, setQuarks] = useState([]);
	let appContext = useContext(AppContext);
	return (
		<div className="screenRoot">
			<img width={"128px"} src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
			<p>You are {appContext?.userData?.username || "loading..."}</p>
			<p>Your email address is {appContext?.userData?.email || "loading..."}</p>
			<p>Quarks: {JSON.stringify(quarks)}</p>
			<button onClick={() => lq.logout()}>Loggery Outtery</button>
			<button onClick={() => appContext.setToken("newTokenValue")}>killtoken</button>
			<button onClick={() => lq.ws.close()}>killws</button>
			<button onClick={async () => setQuarks(await lq.getQuarks())}>Get quarks</button>
			<button onClick={async () => setQuarks([await lq.getUser(quarks[0].owners[0])])}>Get quark owner :O</button>
			<button onClick={async () => console.log(await lq.apiCall("/user/me"))}>Crashery :3</button>
			<button onClick={async () => {
				appContext.setLoading(true)
				await delay(5000);
				appContext.setLoading(false)
				}}>Load for 5s</button>
		</div>
	);
}