import {useContext, useState} from "react";
import {lq} from "../../classes/Lightquark";
import {MainContext} from "../../contexts/MainContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

export function MessageBox() {
	let mainContext = useContext(MainContext);
	let [message, setMessage] = useState("");

	async function send() {
		lq.sendMessage(message, mainContext.selectedChannel);
		setMessage("");
	}

	function handleMessageboxKey(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	return (
		<div className="messageBox">
			<textarea onKeyDown={handleMessageboxKey} className="messageInput" value={message} onInput={(e) => setMessage(e.target.value)} placeholder="Type your message here..." />
			<div className="messageSendButton" onClick={() => {send();}}>
				<FontAwesomeIcon icon={faPaperPlane}>Send</FontAwesomeIcon>
			</div>
		</div>
	);
}