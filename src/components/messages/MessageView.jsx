import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {Message} from "./Message";

export function MessageView(props) {
	let mainContext = useContext(MainContext);
	let [messages, setMessages] = useState([]);
	let [messageElements, setMessageElements] = useState([]);
	
	// eslint-disable-next-line no-unused-vars
	let [scrollDetached, setScrollDetached] = useState(false);

	useEffect(() => {
		lq.setMessageState({messages, setMessages});
	}, [messages])

	/**
	 * Get messages from selected channel when selected channel changes
	 */
	useEffect(() => {
		(async () => {
			if (!mainContext.selectedChannel) return;
			let messages = await lq.getMessages(mainContext.selectedChannel);
			setMessages(messages);
			lq.subscribeToChannel(mainContext.selectedChannel);
		})();
	}, [mainContext.selectedChannel]);

	/**
	 * Create message elements from messages
	 * Sort messages by timestamp
	 */
	useEffect(() => {
		messages.sort((a, b) => {
			return a.message.timestamp - b.message.timestamp;
		});
		setMessageElements(messages.map(message => {
			return (
				<Message setReplyTo={props.setReplyTo} key={message.message._id} messages={messages} message={message} scrollDetached={scrollDetached} />
			);
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages]);

	/**
	 * Scroll to bottom of message view when new messages are added
	 */
	useEffect(() => {
		if (scrollDetached || messageElements.length < 1) return;
		let messageView = document.querySelector(".messageView");
		messageView.scrollTo(0, messageView.scrollHeight);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messageElements])

	return (
		<div className="messageView">
			{messageElements}
		</div>
	);
}