import {Tooltip} from "react-tooltip";
import Linkify from "react-linkify";
import {Attachment} from "./Attachment";

export function Message(props) {
	let message = props.message.message;
	let author = props.message.author;

	function formatDate(date) {
		// If today
		if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
			return `Today at ${date.toLocaleTimeString(navigator.language, {hour: "2-digit", minute: "2-digit"})}`;
		}
		
		return date.toLocaleDateString();
	}

	return (
		<div className="message">
			<img src={author.avatarUri} alt="" width={"32px"} className="messageAvatar" />
			<div>
				<div className="messageUsernameRow">
					<span>{author.username}</span>
					<small id={`${message._id}_timestamp`} data-tooltip-content={new Date(message.timestamp).toLocaleString()} className="messageTimestamp">{formatDate(new Date(message.timestamp))} via {message.ua || "Unknown Client"}</small>
					<Tooltip className="timestampTip" anchorId={`${message._id}_timestamp`} positionStrategy={"fixed"} place={"top"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} />

				</div>
				<div className="messageBody">
					<Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
						<a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key}>{decoratedText}</a>
					)}>
						<span className={message.specialAttributes?.includes("/me") ? "messageItalic" : ""}>{message.content}</span>
					</Linkify>
					{message.attachments?.length > 0 ? <div className="messageAttachments">{message.attachments.map(attachment => {
						return <Attachment attachment={attachment} key={attachment.url} scrollDetached={props.scrollDetached} />
					})}</div>: null}
				</div>

			</div>
		</div>
	);
}