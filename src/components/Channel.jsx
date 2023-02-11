export function Channel(props) {
	let channel = props.channel;
	return (
		<div className="channelBox">
			<span># {channel.name}</span>
		</div>
	);
}