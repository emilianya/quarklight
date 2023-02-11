import {UserBox} from "./UserBox";
import {ChannelContainer} from "./ChannelContainer";
import {QuarkList} from "./QuarkList";
import {QuarkInfo} from "./QuarkInfo";
import {useContext, useEffect} from "react";
import {Quark} from "./Quark";
import {lq} from "../classes/Lightquark";
import {Channel} from "./Channel";
import {AppContext} from "../contexts/AppContext";
import {MainContext} from "../contexts/MainContext";

export function NavContainer() {

	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);

	useEffect(() => {
		mainContext.setQuarkBoxes(appContext.quarks.map(quark => {
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