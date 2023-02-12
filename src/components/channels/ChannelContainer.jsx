import {useContext, useEffect} from "react";
import {MainContext} from "../../contexts/MainContext";
import {AppContext} from "../../contexts/AppContext";
import {lq} from "../../classes/Lightquark";
import {Channel} from "./Channel";

export function ChannelContainer() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);

	useEffect(() => {
		mainContext.setChannelBoxes(appContext.channels.map(channel => {
			let unread = mainContext.unreadChannels.includes(channel._id);
			let selected = mainContext.selectedChannel === channel._id;

			let showUnread = unread && !selected;
			if (unread && selected) {
				mainContext.setUnreadChannels(mainContext.unreadChannels.filter(id => id !== channel._id));
			}

			return (<Channel channel={channel} showUnread={showUnread} setSelectedChannel={mainContext.setSelectedChannel} key={channel._id} />)
		}));
	}, [appContext.channels, mainContext.selectedChannel, mainContext.unreadChannels]);

	return (
		<div className="channelContainer">
			{mainContext.channelBoxes}
		</div>
	);
}