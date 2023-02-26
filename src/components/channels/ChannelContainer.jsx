import {useContext, useEffect} from "react";
import {MainContext} from "../../contexts/MainContext";
import {AppContext} from "../../contexts/AppContext";
import {Channel} from "./Channel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {AddChannelModal} from "../modals/AddChannelModal";

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
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.channels, mainContext.selectedChannel, mainContext.unreadChannels]);

	return (
		<div className="channelContainer">
			{mainContext.channelBoxes}

			{appContext.quarks.find(q => q._id === mainContext.selectedQuark)?.owners?.includes(appContext.userData._id) &&
				<div className="addChannelButton channelBox" onClick={() => mainContext.setShowModal("addChannel")}>
					<FontAwesomeIcon icon={faPlus} className="addChannelIcon"/>
					Add Channel
				</div>
			}
			<AddChannelModal />
		</div>
	);
}