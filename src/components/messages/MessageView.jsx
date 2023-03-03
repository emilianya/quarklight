import {useContext, useEffect, useLayoutEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {Message} from "./Message";
import {MessageContext} from "../../contexts/MessageContext";

export function MessageView() {
	let mainContext = useContext(MainContext);
	let messageContext = useContext(MessageContext);
	let [messageElements, setMessageElements] = useState([]);
	let [storedScroll, setStoredScroll] = useState(null);
	let [loadingMessages, setLoadingMessages] = useState(false);
	let [messages, setMessages] = messageContext.messages;
	let [scrollDetached, setScrollDetached] = messageContext.scrollDetached;

	useEffect(() => {
		lq.setMessageState({messages: messages, setMessages: setMessages});
	}, [messages, setMessages]);


	/**
	 * Get messages from selected channel when selected channel changes
	 */
	useEffect(() => {
		(async () => {
			let messages = await lq.getMessages(mainContext.selectedChannel);
			setMessages(messages);
			lq.subscribeToChannel(mainContext.selectedChannel);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainContext.selectedChannel]);

	/**
	 * Create message elements from messages
	 * Sort messages by timestamp
	 */
	useLayoutEffect(() => {
		messages.sort((a, b) => {
			return a.message.timestamp - b.message.timestamp;
		});
		setMessageElements(messages.map(message => {
			return (
				<Message key={message.message._id} message={message} scrollDetached={scrollDetached} />
			);
		}));

		setTimeout(() => {
			// Restore stored scroll position
			let messageView = document.querySelector(".messageView");
			messageView.style.scrollBehavior = "auto";
			if (storedScroll) messageView.scrollTop = messageView.scrollHeight - storedScroll?.scrollHeight;
			messageView.style.scrollBehavior = "smooth";
			setStoredScroll(null)
			console.log("Scroll restored")
		}, 0)

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

	/**
	 * Set scrollDetached to true if user scrolls up
	 * Set scrollDetached to false if user scrolls to bottom
	 * @param e
	 */
	async function handleMessageViewScroll(e) {
		// I don't know how this works, copilot wrote it.
		let messageView = document.querySelector(".messageView");
		if (messageView.scrollTop + messageView.clientHeight >= messageView.scrollHeight) {
			setScrollDetached(false);
		} else {
			setScrollDetached(true);
		}
		if (messageView.scrollTop === 0 && messages.length > 0) {
			console.log("top");
			setLoadingMessages(true);
			let olderMessages = await lq.getMessages(mainContext.selectedChannel, messages[0].message.timestamp)
			setMessages(olderMessages.concat(messages));
			setStoredScroll({scrollHeight: messageView.scrollHeight, scrollTop: messageView.scrollTop})
			setLoadingMessages(false);
		}
	}

	return (
		<div className="messageView" onScroll={handleMessageViewScroll} style={
			{backgroundColor: scrollDetached && false ? "#333333" : "inherit"}}>
			{loadingMessages && <div className="loadingMessages">Loading messages...</div>}
			{messageElements}
		</div>
	);
}