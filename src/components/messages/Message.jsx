export function Message(props) {
	let message = props.message.message;
	let author = props.message.author;
	let dateFormatter = new Intl.RelativeTimeFormat(navigator.language, {
		numeric: "auto",
		style: "long"
	})

	function formatDate(date) {
		const msPerMinute = 60 * 1000;
		const msPerHour = msPerMinute * 60;
		const msPerDay = msPerHour * 24;
		const msPerWeek = msPerDay * 7;
		const elapsed = new Date() - date;
		if (elapsed < msPerMinute) {
			return dateFormatter.format(Math.floor(elapsed/1000), "second");
		}
		else if (elapsed < msPerHour) {
			return dateFormatter.format(Math.floor(elapsed/msPerMinute), "minute");
		}
		else if (elapsed < msPerDay ) {
			return dateFormatter.format(Math.floor(elapsed/msPerHour), "hour");
		}
		else if (elapsed < msPerWeek) {
			return dateFormatter.format(Math.floor(elapsed/msPerDay), "day");
		}
		return date.toLocaleDateString();
	}

	return (
		<div className="message">
			<img src={author.avatarUri} alt="" width={"32px"} className="messageAvatar" />
			<div>
				<div className="messageUsernameRow">
					<span>{author.username}</span>
					<small className="messageTimestamp">{formatDate(new Date(message.timestamp))} via {message.ua || "Unknown Client"}</small>
				</div>
				<div className="messageBody">
					<span>{message.content}</span>
				</div>

			</div>
		</div>
	);
}