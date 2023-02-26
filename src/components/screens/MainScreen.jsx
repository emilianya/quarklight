import {useContext, useEffect, useState} from "react";
import {AppContext} from "../../contexts/AppContext";
import { lq } from "../../classes/Lightquark";
import "../../main.css";
import {NavContainer} from "../nav/NavContainer";
import {ContentContainer} from "../messages/ContentContainer";
import {MainContext} from "../../contexts/MainContext";
import pjson from '../../../package.json';

const delay = ms => new Promise(res => setTimeout(res, ms));

export function MainScreen() {
	let [quarkBoxes, setQuarkBoxes] = useState([]);
	let [channelBoxes, setChannelBoxes] = useState([]);
	let appContext = useContext(AppContext);
	let [selectedQuark, setSelectedQuark] = useState(null);
	let [selectedChannel, setSelectedChannel] = useState(null);
	let [unreadChannels, setUnreadChannels] = useState([]);
	let [showJoinModal, setShowJoinModal] = useState(false);
	let [showCreateModal, setShowCreateModal] = useState(false);


	let [konamiState, setKonamiState] = useState(0);
	let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

	useEffect(() => {
		if (!appContext.loading && !selectedQuark && appContext.quarks.length > 0) {
			setSelectedQuark(appContext.quarks[0]._id);
		}
		if (!appContext.loading && !selectedChannel && appContext.channels.length > 0) {
			console.log("Selecting first channel")
			setSelectedChannel(appContext.channels[0]._id);
		}
	}, [appContext.loading, selectedQuark, selectedChannel, appContext.quarks, appContext.channels])

	return (
		<div data-testid="screenRoot" className="screenRoot" onKeyDown={a=>{a.key===konamiCode[konamiState]?setKonamiState(konamiState+1):setKonamiState(0);if (!a.shiftKey && !a.ctrlKey && !a.altKey && !a.metaKey && !showJoinModal && !showCreateModal) document.querySelector(".messageInput").focus();}} tabIndex="0">
			{ // Debug menu 
			konamiState === konamiCode.length ? <div style={{overflowY: "scroll", height: "100vh"}} >
				<img width={"128px"} src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
				<p>You are {appContext?.userData?.username || "loading..."}</p>
				<p>Your email address is {appContext?.userData?.email || "loading..."}</p>
				<p>Selected channel: {JSON.stringify(selectedChannel)}</p>
				<p>Selected quark: {JSON.stringify(selectedQuark)}</p>
				<p>You are on {pjson.version.endsWith("-release") ? `${pjson.version} (Stable)` : `${pjson.version} (Quantum)`}</p>
				<details><summary>Quarks</summary>{JSON.stringify(appContext.quarks)}</details>
				<button onClick={() => lq.logout()}>Loggery Outtery</button>
				<button onClick={() => appContext.setToken("newTokenValue")}>killtoken</button>
				<button onClick={() => lq.ws.close()}>killws</button>
				<button onClick={async () => appContext.setQuarks(await lq.getQuarks())}>Get quarks</button>
				<button onClick={async () => appContext.setQuarks([await lq.getUser(appContext.quarks[0].owners[0])])}>Get quark owner :O</button>
				<button onClick={async () => console.log(await lq.apiCall("/user/me"))}>Log user info</button>
				<button onClick={async () => {
					appContext.setLoading(true)
					await delay(5000);
					appContext.setLoading(false)
					}}>Load for 5s</button>
			</div> : 
			// Actual application starts here
			<div className="appContainer">
				<MainContext.Provider value={{
						selectedChannel, setSelectedChannel,
						selectedQuark, setSelectedQuark,
						quarkBoxes, setQuarkBoxes,
						channelBoxes, setChannelBoxes,
						unreadChannels, setUnreadChannels,
						showJoinModal, setShowJoinModal,
						showCreateModal, setShowCreateModal
					}}>
					<ContentContainer />
					<NavContainer />
				</MainContext.Provider>
			</div>
			}
		</div>
	);
}