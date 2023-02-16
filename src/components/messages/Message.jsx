import {Tooltip} from "react-tooltip";
import Linkify from "react-linkify";
import {Attachment} from "./Attachment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import {useContextMenu, Menu, Item} from "react-contexify";
import {useContext} from "react";
import {AppContext} from "../../contexts/AppContext";
import { lq } from "../../classes/Lightquark";

export function Message(props) {

	let appContext = useContext(AppContext);

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

	const { show } = useContextMenu({
		id: `${message._id}_menu`,
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
			<div className="message" onContextMenu={handleContextMenu}>
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
							<span className={message.specialAttributes?.some(a => a.type === "/me") ? "messageItalic" : ""}>{message.content}</span><small style={{color: "lightgray", userSelect: "none"}} hidden={!message?.edited}> (edited)</small>
						</Linkify>
						{message.attachments?.length > 0 ? <div className="messageAttachments">{message.attachments.map(attachment => {
							return <Attachment attachment={attachment} key={attachment.url} scrollDetached={props.scrollDetached} />
						})}</div>: null}
					</div>
				</div>
			</div>
			<Menu id={`${message._id}_menu`} className="messageMenu" theme={"dark"}>
				{message?.authorId === appContext.userData._id ? 
				<Item onClick={() => lq.deleteMessage(message._id, message.channelId)}>Delete message</Item> : null}
				<Item onClick={() => props.setReplyTo(message._id)}>Reply</Item>
				<Item onClick={() => navigator.clipboard.writeText(message._id)}>Copy ID</Item>
			</Menu>
		</>
	);
}