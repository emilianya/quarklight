import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {Message} from "./Message";

export function MessageView(props) {
	let mainContext = useContext(MainContext);
	let [messageElements, setMessageElements] = useState([]);
	
	// eslint-disable-next-line no-unused-vars
	let [scrollDetached, setScrollDetached] = useState(false);

	useEffect(() => {
		lq.setMessageState({messages: props.messages, setMessages: props.setMessages});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.messages])

	/**
	 * Get messages from selected channel when selected channel changes
	 */
	useEffect(() => {
		(async () => {
			if (!mainContext.selectedChannel) return;
			let messages = await lq.getMessages(mainContext.selectedChannel);
			props.setMessages(messages);
			lq.subscribeToChannel(mainContext.selectedChannel);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainContext.selectedChannel]);

	/**
	 * Create message elements from messages
	 * Sort messages by timestamp
	 */
	useEffect(() => {
		props.messages.sort((a, b) => {
			return a.message.timestamp - b.message.timestamp;
		});
		setMessageElements(props.messages.map(message => {
			return (
				<Message setReplyTo={props.setReplyTo} key={message.message._id} messages={props.messages} message={message} scrollDetached={scrollDetached} />
			);
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.messages]);

	/**
	 * Scroll to bottom of message view when new messages are added
	 */
	useEffect(() => {
		if (scrollDetached || messageElements.length < 1) return;
		let messageView = document.querySelector(".messageView");
		messageView.scrollTo(0, messageView.scrollHeight);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messageElements])

	/**
	 * Set scrollDetached to true if user scrolls up
	 * Set scrollDetached to false if user scrolls to bottom
	 * @param e
	 */
	function handleMessageViewScroll(e) {
		// I don't know how this works, copilot wrote it.
		let messageView = document.querySelector(".messageView");
		if (messageView.scrollTop + messageView.clientHeight >= messageView.scrollHeight) {
			setScrollDetached(false);
		} else {
			setScrollDetached(true);
		}
	}

	return (
		<div className="messageView" onScroll={handleMessageViewScroll} style={
			{backgroundColor: scrollDetached && false ? "#333333" : "inherit",
				height: props.replyTo ? "calc(100vh - 8.3rem)" : ""
			}}>
			{messageElements}
		</div>
	);
}