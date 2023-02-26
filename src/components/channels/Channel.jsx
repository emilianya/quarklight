import {Item, Menu, Separator, useContextMenu} from "react-contexify";
import {useContext} from "react";
import {AppContext} from "../../contexts/AppContext";
import {lq} from "../../classes/Lightquark";
import {MainContext} from "../../contexts/MainContext";

export function Channel(props) {
	let channel = props.channel;
	let appContext = useContext(AppContext);
	let mainContext = useContext(MainContext);
	const { show } = useContextMenu({
		id: `${channel._id}_menu`,
	});

	function handleContextMenu(event){
		show({
			event,
			props: {
				key: 'value'
			}
		})
	}
	return (
		<>
			<div onContextMenu={handleContextMenu} id={`${channel._id}`} className="channelBox" onClick={() => props.setSelectedChannel(channel._id)}>
				<span># {channel.name}</span>
				{props.showUnread ? <div className="unreadIndicator"></div> : null}

			</div>
			<Menu id={`${channel._id}_menu`} className="channelMenu" theme={"dark"}>
				<Item disabled={true}><span>{channel.name}</span></Item>
				<Separator />
				{appContext.quarks.find(q => q._id === channel.quark).owners.includes(appContext.userData._id) &&
					<>
						<Item onClick={() => {
						if (!window.confirm("Are you sure you want to delete this channel?")) return;
						if (!window.confirm("Are you REALLY sure?")) return;
						lq.deleteChannel(channel._id)
						}} className="deleteButton">Delete</Item>

						<Item onClick={() => {
							mainContext.setShowModal("editChannel");
							props.setEditingChannel(channel);
						}}>Edit</Item>

					</>
				}
				<Item onClick={() => navigator.clipboard.writeText(`lightquark://${channel.quark}/${channel._id}`)}>Copy Lightquark link</Item>
				<Item onClick={() => navigator.clipboard.writeText(`https://lq.litdevs.org/d/${channel.quark}/${channel._id}`)}>Copy web link</Item>
				<Item onClick={() => navigator.clipboard.writeText(channel._id)}>Copy ID</Item>
			</Menu>
		</>
	);
}