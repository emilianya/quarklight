import {UserBox} from "./UserBox";
import {ChannelContainer} from "../channels/ChannelContainer";
import {QuarkList} from "../quarks/QuarkList";
import {QuarkInfo} from "../quarks/QuarkInfo";
import {useContext, useEffect} from "react";
import {Quark} from "../quarks/Quark";
import {lq} from "../../classes/Lightquark";
import {Channel} from "../channels/Channel";
import {AppContext} from "../../contexts/AppContext";
import {MainContext} from "../../contexts/MainContext";

export function NavContainer() {

	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);

	useEffect(() => {
		let quarks = appContext.quarks.sort((a, b) => { return a.name.localeCompare(b.name) });
		mainContext.setQuarkBoxes(quarks.map(quark => {
			return (<Quark quark={quark} setSelectedQuark={mainContext.setSelectedQuark} key={quark._id} />)
		}));
	}, [appContext.quarks])


	useEffect(() => {
		if (!mainContext.selectedQuark) return;
		(async () => {
			console.log("Getting channels for quark " + mainContext.selectedQuark)
			lq.setAppContext(appContext);
			appContext.setChannels([]);
			let channels = await lq.getChannels(mainContext.selectedQuark);
			appContext.setChannels(channels);
			let quarks = appContext.quarks.filter(q => q._id !== mainContext.selectedQuark);
			console.log("Updating quark information for " + mainContext.selectedQuark);
			let updatedQuark = await lq.getQuark(mainContext.selectedQuark);
			quarks.push(updatedQuark);
			appContext.setQuarks(quarks);
			channels = await lq.getChannels(mainContext.selectedQuark);
			appContext.setChannels(channels);
		})()
	}, [mainContext.selectedQuark])

	return (
		<div className="navContainer">
			<UserBox />
			<hr style={{width: "90%"}} />
			<QuarkInfo />
			<div className="quarkInfo">
				<ChannelContainer />
				<QuarkList />
			</div>
		</div>
	);
}