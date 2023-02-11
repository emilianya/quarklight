import {useContext, useState} from "react";
import {lq} from "../../classes/Lightquark";
import {MainContext} from "../../contexts/MainContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

export function MessageBox() {
	let mainContext = useContext(MainContext);
	let [message, setMessage] = useState("");

	return (
		<div className="messageBox">
			<textarea className="messageInput" value={message} onInput={(e) => setMessage(e.target.value)} className="messageInput" placeholder="Type your message here..." />

			<FontAwesomeIcon icon={faPaperPlane} className="messageSendButton" onClick={
				() => {
					lq.sendMessage(message, mainContext.selectedChannel);
					setMessage("");
				}}
			>Send</FontAwesomeIcon>
		</div>
	);
}