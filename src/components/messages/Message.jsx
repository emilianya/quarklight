import {Tooltip} from "react-tooltip";
import Linkify from "react-linkify";
import {Attachment} from "./Attachment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import {useContextMenu, Menu, Item} from "react-contexify";
import {useContext, useState} from "react";
import {AppContext} from "../../contexts/AppContext";
import { lq } from "../../classes/Lightquark";
import {MessageContext} from "../../contexts/MessageContext";

export function Message(props) {

	let appContext = useContext(AppContext);
	let messageContext = useContext(MessageContext);

	let setEditing = messageContext.editing[1];
	let scrollDetached = messageContext.scrollDetached[0];
	let setReplyTo = messageContext.replyTo[1];

	let [showModified, setShowModified] = useState(false);

	let message = props.message.message;

	// Regex for lightquark:// links
	// Groups: protocol, quarkId, channelId?, messageId?
	let lightquarkRegex = /(?<protocol>lightquark:\/\/)(?<quarkId>[a-zA-Z0-9]+)(?<channelId>\/[a-zA-Z0-9]*)?(?<mesageId>\/[a-zA-Z0-9]*)?/gm

	// Replace regex matches with links
	message.content = message.content.replace(lightquarkRegex, (match, protocol, quarkId, channelId, messageId) => {
		return `https://lq.litdevs.org/d/${quarkId}${channelId || ""}${messageId || ""}`;
	});


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
			<div className="message" id={`${message._id}_message`} onContextMenu={handleContextMenu}>
				<img src={botMessage?.avatarUri || author.avatarUri} alt="" width={"32px"} className="messageAvatar" />
				<div>
					{replyMessage ?
					<div className="messageReply" onClick={() => {
						document.getElementById(`${replyMessage.replyTo}_message`).scrollIntoView();
					}}>
						<FontAwesomeIcon className="messageReplyIcon" icon={faReply} />
						<small className="messageReplyUsername">{message.reply.author.username || "Unknown User"}</small>
						<small className="messageReplyBody">{(appContext.preferences.usePlainText && !showModified) ? message.reply.message.original : message.reply.message.content || "Unknown Message"}</small>
					</div>
					: null}
					<div className="messageUsernameRow">
						<span>{botMessage?.username || author.username}</span>{botMessage ? <><span id={`${message._id}_bot`} data-tooltip-content={`This message was sent by a bot called ${author.username}`} className="botBadge">{author.username}</span><Tooltip className="botTip" anchorId={`${message._id}_bot`} positionStrategy={"fixed"} place={"top"} style={{opacity: 1, backgroundColor: "var(--tooltip)", color: "var(--white)"}} /></> : null}
						<small id={`${message._id}_timestamp`} data-tooltip-content={new Date(message.timestamp).toLocaleString()} className="messageTimestamp">{formatDate(new Date(message.timestamp))} via {message.ua || "Unknown Client"}</small>
						<Tooltip className="timestampTip" anchorId={`${message._id}_timestamp`} positionStrategy={"fixed"} place={"top"} style={{opacity: 1, backgroundColor: "var(--tooltip)", color: "var(--white)"}} />
					</div>
					<div className="messageBody">
						<Linkify componentDecorator={(decoratedHref, decoratedText, key) => {
							if (decoratedHref.startsWith("https://lq.litdevs.org/d/")) {
								let lqPart = decoratedHref.split("https://lq.litdevs.org/d/")[1];
								let lqProtocol = `lightquark://${lqPart}`;
								return (
									<span className="link" onClick={() => lq.openLqLink(lqProtocol)} key={key}>{lqProtocol}</span>
								)
							}
							return (
								<a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key}>{decoratedText}</a>
							)
						}}>
							<span className={message.specialAttributes?.some(a => a.type === "/me") ? "messageItalic" : ""}>{(appContext.preferences.usePlainText && !showModified) ? message.original : message.content}</span><small hidden={message.original === message.content || !appContext.preferences.ql_showModifiedToggle} onClick={() => {setShowModified(p => !p)}} style={{color: "var(--lightgrey)", userSelect: "none", cursor: "pointer"}}> {showModified ? "Hide" : "Show"} modified</small><small style={{color: "var(--lightgrey)", userSelect: "none"}} hidden={!message?.edited}> (edited)</small>
						</Linkify>
						{message.attachments?.length > 0 ? <div className="messageAttachments">{message.attachments.map(attachment => {
							return <Attachment attachment={attachment} key={attachment.url} scrollDetached={scrollDetached} />
						})}</div>: null}
					</div>
				</div>
			</div>
			<Menu id={`${message._id}_menu`} className="messageMenu" theme={"dark"}>
				{message?.authorId === appContext.userData._id ? 
					<>
						<Item onClick={() => lq.deleteMessage(message._id, message.channelId)}>Delete message</Item>
						<Item onClick={() => setEditing(message._id)}>Edit</Item>
					</> : null}
				<Item onClick={() => setReplyTo(message._id)}>Reply</Item>
				<Item onClick={async () => navigator.clipboard.writeText(`lightquark://${(await lq.getChannel(message.channelId)).quark}/${message.channelId}/${message._id}`)}>Copy Lightquark link</Item>
				<Item onClick={async () => navigator.clipboard.writeText(`https://lq.litdevs.org/d/${(await lq.getChannel(message.channelId)).quark}/${message.channelId}/${message._id}`)}>Copy web link</Item>
				<Item onClick={async () => navigator.clipboard.writeText(message.content)}>Copy message contents</Item>
				<Item onClick={() => navigator.clipboard.writeText(message._id)}>Copy ID</Item>
			</Menu>
		</>
	);
}