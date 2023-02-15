import {Tooltip} from "react-tooltip";
import Linkify from "react-linkify";
import {Attachment} from "./Attachment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";

export function Message(props) {

	let message = props.message.message;
	let author = props.message.author;

	let botMessage = message?.specialAttributes?.find(a => a.type === "botMessage")
	let replyMessage = message?.specialAttributes?.find(a => a.type === "reply")

	function formatDate(date) {
		// If today
		if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
			return `Today at ${date.toLocaleTimeString(navigator.language, {hour: "2-digit", minute: "2-digit"})}`;
		}
		
		return date.toLocaleDateString();
	}

	return (
		<div className="message">
			<img src={botMessage?.avatarUri || author.avatarUri} alt="" width={"32px"} className="messageAvatar" />
			<div>
				{replyMessage ?
				<div className="messageReply">
					<FontAwesomeIcon className="messageReplyIcon" icon={faReply} />
					<small className="messageReplyUsername">{props.messages.find(m => m.message._id === replyMessage.replyTo)?.author.username || "Unknown User"}</small>
					<small className="messageReplyBody">{props.messages.find(m => m.message._id === replyMessage.replyTo)?.message.content || "Unknown Message"}</small>
				</div>
				: null}
				<div className="messageUsernameRow">
					<span>{botMessage?.username || author.username}</span>{botMessage ? <><span id={`${message._id}_bot`} data-tooltip-content={`This message was sent by a bot called ${author.username}`} className="botBadge">{author.username}</span><Tooltip className="botTip" anchorId={`${message._id}_bot`} positionStrategy={"fixed"} place={"top"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} /></> : null}
					<small id={`${message._id}_timestamp`} data-tooltip-content={new Date(message.timestamp).toLocaleString()} className="messageTimestamp">{formatDate(new Date(message.timestamp))} via {message.ua || "Unknown Client"}</small>
					<Tooltip className="timestampTip" anchorId={`${message._id}_timestamp`} positionStrategy={"fixed"} place={"top"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} />
				</div>
				<div className="messageBody">
					<Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
						<a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key}>{decoratedText}</a>
					)}>
						<span className={message.specialAttributes?.some(a => a.type === "/me") ? "messageItalic" : ""}>{message.content}</span>
					</Linkify>
					{message.attachments?.length > 0 ? <div className="messageAttachments">{message.attachments.map(attachment => {
						return <Attachment attachment={attachment} key={attachment.url} scrollDetached={props.scrollDetached} />
					})}</div>: null}
				</div>

			</div>
		</div>
	);
}