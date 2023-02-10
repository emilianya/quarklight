import {useContext, useEffect, useState} from "react";
import {AppContext} from "../contexts/AppContext";
import { lq } from "../classes/Lightquark";
import "./../main.css";
import {Quark} from "./Quark";
import {Channel} from "./Channel";
const delay = ms => new Promise(res => setTimeout(res, ms));

export function MainScreen() {
	let [quarkBoxes, setQuarkBoxes] = useState([]);
	let [channelBoxes, setChannelBoxes] = useState([]);
	let appContext = useContext(AppContext);
	let [selectedQuark, setSelectedQuark] = useState(null);
	let [selectedChannel, setSelectedChannel] = useState(null);

	useEffect(() => {
		setQuarkBoxes(appContext.quarks.map(quark => {
			return (<Quark quark={quark} setSelectedQuark={setSelectedQuark} key={quark._id} />)
		}));
	}, [appContext.quarks])


	useEffect(() => {
		if (!selectedQuark) return;
		(async () => {
			console.log("Getting channels for quark " + selectedQuark)
			lq.setAppContext(appContext);
			appContext.channels = await lq.getChannels(selectedQuark);
			setChannelBoxes(appContext.channels.map(channel => {
				return (<Channel channel={channel} setSelectedChannel={setSelectedChannel} key={channel._id} />)
			}));
		})()
	}, [selectedQuark])

	let [konamiState, setKonamiState] = useState(0);
	var konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

	return (
		<div data-testid="screenRoot" className="screenRoot" onKeyDown={a=>{a.key===konamiCode[konamiState]?setKonamiState(konamiState+1):setKonamiState(0)}} tabIndex="0">
			{ // Debug menu 
			konamiState === konamiCode.length ? <div>
				<img width={"128px"} src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
				<p>You are {appContext?.userData?.username || "loading..."}</p>
				<p>Your email address is {appContext?.userData?.email || "loading..."}</p>
				<p>Selected channel: {JSON.stringify(selectedChannel)}</p>
				<p>Selected quark: {JSON.stringify(selectedQuark)}</p>
				<p>Quarks: {JSON.stringify(appContext.quarks)}</p>
				<button onClick={() => lq.logout()}>Loggery Outtery</button>
				<button onClick={() => appContext.setToken("newTokenValue")}>killtoken</button>
				<button onClick={() => lq.ws.close()}>killws</button>
				<button onClick={async () => appContext.setQuarks(await lq.getQuarks())}>Get quarks</button>
				<button onClick={async () => appContext.setQuarks([await lq.getUser(appContext.quarks[0].owners[0])])}>Get quark owner :O</button>
				<button onClick={async () => console.log(await lq.apiCall("/user/me"))}>Crashery :3</button>
				<button onClick={async () => {
					appContext.setLoading(true)
					await delay(5000);
					appContext.setLoading(false)
					}}>Load for 5s</button>
			</div> : 
			// Actual application starts here
			<div className="appContainer">
				<div className="contentContainer">

				</div>
				<div className="navContainer">
					<div className="userBox">
						<img width={"48px"} className="avatar" src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
						<span className="username">{appContext?.userData?.username}</span><br />
						<span>subtext</span>
					</div>
					<div className="quarkInfo">
						<div className="channelContainer">
							{channelBoxes}
						</div>
						<div className="quarkList">
							{quarkBoxes}
						</div>
					</div>
				</div>
			</div>
			}
		</div>
	);
}