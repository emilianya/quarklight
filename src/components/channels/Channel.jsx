import {Item, Menu, Separator, useContextMenu} from "react-contexify";

export function Channel(props) {
	let channel = props.channel;
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
				<span># {channel.name}{props.showUnread ? " !!!" : ""}</span>
				{props.showUnread ? <div className="unreadIndicator"></div> : null}

			</div>
			<Menu id={`${channel._id}_menu`} className="channelMenu" theme={"dark"}>
				<Item disabled={true}><span>{channel.name}</span></Item>
				<Separator />
				<Item onClick={() => navigator.clipboard.writeText(channel._id)}>Copy ID</Item>
			</Menu>
		</>
	);
}