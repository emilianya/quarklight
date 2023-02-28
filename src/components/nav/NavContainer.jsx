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
		let quarks = appContext.quarks.sort((a, b) => {
			let indexOfA = mainContext.quarkOrder?.indexOf(a._id) || 1;
			let indexOfB = mainContext.quarkOrder?.indexOf(b._id) || 0;
			return indexOfA - indexOfB;
		});
		mainContext.setQuarkBoxes(quarks.map(quark => {
			return (<Quark quark={quark} setSelectedQuark={mainContext.setSelectedQuark} key={quark._id} />)
		}));
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.quarks, mainContext.quarkOrder])


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