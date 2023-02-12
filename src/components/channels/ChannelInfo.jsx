export function ChannelInfo(props) {
	let channel = props.channel || {name: "", description: ""};
	return (
		<div className="channelInfo">
			<span style={{fontWeight: "500", marginRight: "1rem"}}>#{channel.name}</span>
			<span style={{fontWeight: "300", maxWidth: "calc(100vw - 25rem)", color: "gray", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden"}}>{channel.description || ""}</span>
		</div>
	);
}