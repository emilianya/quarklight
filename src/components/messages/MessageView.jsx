import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {AppContext} from "../../contexts/AppContext";
import {lq} from "../../classes/Lightquark";
import {Message} from "./Message";

export function MessageView() {
	let mainContext = useContext(MainContext);
	let [messages, setMessages] = useState([]);
	let [messageElements, setMessageElements] = useState([]);
	let [scrollDetached, setScrollDetached] = useState(false);

	/**
	 * Get messages from selected channel when selected channel changes
	 */
	useEffect(() => {
		(async () => {
			if (!mainContext.selectedChannel) return;
			let messages = await lq.getMessages(mainContext.selectedChannel);
			setMessages(messages);
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
				<Message key={message.message._id} message={message} />
			);
		}));
	}, [messages]);

	/**
	 * Scroll to bottom of message view when new messages are added
	 */
	useEffect(() => {
		if (scrollDetached) return;
		let messageView = document.querySelector(".messageView");
		messageView.scrollTo(0, messageView.scrollHeight);
	}, [messageElements])

	return (
		<div className="messageView">
			{messageElements}
		</div>
	);
}