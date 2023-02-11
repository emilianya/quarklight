export function Message(props) {
	let message = props.message.message;
	let author = props.message.author;
	return (
		<div className="message">
			<img src={author.avatarUri} alt="" width={"32px"} className="messageAvatar" />
			<div>
				<div className="messageUsernameRow">
					<span>{author.username}</span>
					<small className="messageTimestamp">{new Date(message.timestamp).toLocaleString()} via {message.ua || "Unknown Client"}</small>
				</div>
				<div className="messageBody">
					<span>{message.content}</span>
				</div>

			</div>
		</div>
	);
}