import {useContext, useEffect} from "react";
import {MainContext} from "../contexts/MainContext";
import {AppContext} from "../contexts/AppContext";
import {lq} from "../classes/Lightquark";
import {Channel} from "./Channel";

export function ChannelContainer() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);

	useEffect(() => {
		mainContext.setChannelBoxes(appContext.channels.map(channel => {
			return (<Channel channel={channel} setSelectedChannel={mainContext.setSelectedChannel} key={channel._id} />)
		}));
	}, [appContext.channels]);

	return (
		<div className="channelContainer">
			{mainContext.channelBoxes}
		</div>
	);
}