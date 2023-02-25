import {UserBox} from "./UserBox";
import {ChannelContainer} from "../channels/ChannelContainer";
import {QuarkList} from "../quarks/QuarkList";
import {QuarkInfo} from "../quarks/QuarkInfo";
import {useContext, useEffect, useState} from "react";
import {Quark} from "../quarks/Quark";
import {lq} from "../../classes/Lightquark";
import {AppContext} from "../../contexts/AppContext";
import {MainContext} from "../../contexts/MainContext";

export function NavContainer() {

	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);

	let [showNav, setShowNav] = useState(true);

	useEffect(() => {
		console.log("Updating quarkboxes")
		let quarks = appContext.quarks.sort((a, b) => { return a.name.localeCompare(b.name) });
		console.log("at render time", quarks)
		mainContext.setQuarkBoxes(quarks.map(quark => {
			return (<Quark quark={quark} setSelectedQuark={mainContext.setSelectedQuark} key={quark._id} />)
		}));
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.quarks])


	useEffect(() => {
		if (!mainContext.selectedQuark) return;
		(async () => {
			lq.setAppContext(appContext);
			appContext.setChannels([]);
			let channels = await lq.getChannels(mainContext.selectedQuark);
			appContext.setChannels(channels);
			if (channels.length > 0 && !channels.some(c => c._id === mainContext.selectedChannel)) mainContext.setSelectedChannel(channels[0]._id);
		})()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainContext.selectedQuark])

	return (
		<div className={showNav ? "navContainer" : "navContainer navContainer-hidden"}>
			<button onClick={() => setShowNav(!showNav)}>{showNav ? "Hide" : "Show"} navigation</button>
			{showNav ? (
				<>
					<UserBox />
					<hr style={{width: "90%"}} />
					<QuarkInfo />
					<div className="quarkInfo">
						<ChannelContainer />
						<QuarkList />
					</div>
				</>)
			: null}
		</div>
	);
}