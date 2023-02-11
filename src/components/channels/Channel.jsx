export function Channel(props) {
	let channel = props.channel;
	return (
		<div className="channelBox" onClick={() => props.setSelectedChannel(channel._id)}>
			<span># {channel.name}</span>
		</div>
	);
}