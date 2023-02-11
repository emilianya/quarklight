export function Message(props) {
	let message = props.message.message;
	let author = props.message.author;
	return (
		<div className="message">
			<img src={author.avatarUri} alt="" width={"32px"} className="avatar" />
			{message.content} at {new Date(message.timestamp).toLocaleString()}
		</div>
	);
}