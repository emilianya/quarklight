import {useContext, useEffect, useState} from "react";
import {lq} from "../../classes/Lightquark";
import {MainContext} from "../../contexts/MainContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperclip, faPaperPlane} from '@fortawesome/free-solid-svg-icons'

// TODO: Indicator for replying and attachments
// TODO: Upload progress indicator
// TODO: Upload cancel button
// TODO: Allow sending other messages while uploading in background

export function MessageBox(props) {
	let mainContext = useContext(MainContext);
	let [message, setMessage] = useState("");
	let [attachments, setAttachments] = useState([]);
	let [sendDisabled, setSendDisabled] = useState(false);
	let [uploading, setUploading] = useState(false);

	const evaluateSendDisabled = () => {
		// If there is no message content and no attachments, disable the send button
		// While uploading, disable the send button
		if ((message.trim().length === 0 && attachments.length === 0) || uploading) setSendDisabled(true);
		else setSendDisabled(false);

	}

	useEffect(() => {
		evaluateSendDisabled();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message, uploading, attachments])

	function arrayBufferToBase64( buffer ) {
		let binary = '';
		let bytes = new Uint8Array( buffer );
		let len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	async function send() {
		if (sendDisabled) return;
		setUploading(true);
		setMessage("");
		let fileInput = document.getElementById("fileInput");
		await lq.sendMessage(message, [...attachments], mainContext.selectedChannel, props.replyTo);
		fileInput.value = "";
		setAttachments([]);
		setUploading(false);
		props.setReplyTo(null);
	}

	function handleMessageboxKey(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function handlePaste(e) {
		let items = (e.clipboardData || e.originalEvent.clipboardData).items;
		let promises = [];
		for (let i = 0; i < items.length; i++) {
			if (items[i].type.indexOf("image") !== -1) {
				promises.push(new Promise((resolve) => {
					let blob = items[i].getAsFile();
					let reader = new FileReader();
					reader.readAsArrayBuffer(blob);
					reader.onload = () => {
						attachments.push({
							filename: blob.name,
							data: arrayBufferToBase64(reader.result)
						});
						resolve();
					}
				}))
			}
		}
		Promise.all(promises).then(() => {
			setAttachments(attachments);
			evaluateSendDisabled();
		});
	}

	function handleFileChange(e) {
		// Add files to attachments
		let files = e.target.files;
		let promises = [];
		for (let i = 0; i < files.length; i++) {
			promises.push(new Promise((resolve) => {
				let reader = new FileReader();
				reader.readAsArrayBuffer(files[i]);
				reader.onload = () => {
					attachments.push({
						filename: files[i].name,
						data: arrayBufferToBase64(reader.result)
					});
					resolve();
				}
			}))
		}
		Promise.all(promises).then(() => {
			setAttachments(attachments);
			evaluateSendDisabled();
		});
	}

	function handleDrop(e) {
		e.preventDefault();
		let files = e.dataTransfer.files;
		let promises = [];
		for (let i = 0; i < files.length; i++) {
			promises.push(new Promise((resolve) => {
				let reader = new FileReader();
				reader.readAsArrayBuffer(files[i]);
				reader.onload = () => {
					attachments.push({
						filename: files[i].name,
						data: arrayBufferToBase64(reader.result)
					});
					resolve();
				}
			}))
		}
		Promise.all(promises).then(() => {
			setAttachments(attachments);
			evaluateSendDisabled();
		});
	}

	// TODO: Show visual indicator for attachments and reply
	// Also, add a way to remove attachments
	return (
		<div className="messageBox" onDrop={handleDrop}>
			<input type="file" className="messageFile" hidden={true} multiple onChange={handleFileChange} name="file" id="fileInput"/>
			<textarea onPaste={handlePaste} onKeyDown={handleMessageboxKey} disabled={uploading} className="messageInput" value={message} onInput={(e) => setMessage(e.target.value)} placeholder={uploading ? "Sending message..." : "Type your message here..."} />
			<div className={"messageAttachButton"} onClick={() => {document.querySelector("#fileInput").click();}}>
				<FontAwesomeIcon icon={faPaperclip}>Send</FontAwesomeIcon>
			</div>
			<div className={sendDisabled ? "messageSendButton messageSendButtonDisabled" : "messageSendButton"} onClick={() => {send();}}>
				<FontAwesomeIcon icon={faPaperPlane}>Send</FontAwesomeIcon>
			</div>
		</div>
	);
}