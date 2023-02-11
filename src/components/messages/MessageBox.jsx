import {useContext, useState} from "react";
import {lq} from "../../classes/Lightquark";
import {MainContext} from "../../contexts/MainContext";

export function MessageBox() {
	let mainContext = useContext(MainContext);
	let [message, setMessage] = useState("");

	return (
		<div className="messageBox">
			<textarea value={message} onInput={(e) => setMessage(e.target.value)} className="messageInput" placeholder="Type your message here..." />
			<button className="messageSendButton" onClick={
				() => {
					lq.apiCall(`/channel/${mainContext.selectedChannel}/messages`, "POST", {content: message});
					setMessage("");
				}}
			>Send</button>
		</div>
	);
}