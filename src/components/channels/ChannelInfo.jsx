import Linkify from "linkify-react";

export function ChannelInfo(props) {
	let channel = props.channel || {name: "", description: ""};
	return (
		<div className="channelInfo">
			<span style={{fontWeight: "500", marginRight: "1rem"}}>#{channel.name}</span>
			<Linkify options={{render: ({
				attributes,
				content
			}) => ( <a target="_blank" rel="noopener noreferrer" href={attributes.href}>{content}</a> )}}>
				<span style={{
					fontWeight: "300",
					maxWidth: "calc(100vw - 25rem)",
					color: "gray",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					overflow: "hidden"
				}}>
					{channel.description || ""}
				</span>
			</Linkify>

		</div>
	);
}