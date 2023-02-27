import {useContext, useEffect, useLayoutEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {Message} from "./Message";

export function MessageView(props) {
	let mainContext = useContext(MainContext);
	let [messageElements, setMessageElements] = useState([]);
	let [storedScroll, setStoredScroll] = useState(null);
	let [loadingMessages, setLoadingMessages] = useState(false);
	
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
	useLayoutEffect(() => {
		props.messages.sort((a, b) => {
			return a.message.timestamp - b.message.timestamp;
		});
		setMessageElements(props.messages.map(message => {
			return (
				<Message setEditing={props.setEditing} setReplyTo={props.setReplyTo} key={message.message._id} messages={props.messages} message={message} scrollDetached={scrollDetached} />
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
	async function handleMessageViewScroll(e) {
		// I don't know how this works, copilot wrote it.
		console.log(props.messages)
		let messageView = document.querySelector(".messageView");
		if (messageView.scrollTop + messageView.clientHeight >= messageView.scrollHeight) {
			setScrollDetached(false);
		} else {
			setScrollDetached(true);
		}
		if (messageView.scrollTop === 0 && props.messages.length > 0) {
			console.log("top");
			setLoadingMessages(true);
			let olderMessages = await lq.getMessages(mainContext.selectedChannel, props.messages[0].message.timestamp)
			props.setMessages(olderMessages.concat(props.messages));
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