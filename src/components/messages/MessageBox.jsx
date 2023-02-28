import {useContext, useEffect, useState} from "react";
import {lq} from "../../classes/Lightquark";
import {MainContext} from "../../contexts/MainContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFile, faPaperclip, faPaperPlane, faPencil, faReply, faX} from '@fortawesome/free-solid-svg-icons'

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
		if (props.editing) return setSendDisabled(message.trim().length === 0);
		if ((message.trim().length === 0 && attachments.length === 0) || uploading) setSendDisabled(true);
		else setSendDisabled(false);
	}

	useEffect(() => {
		evaluateSendDisabled();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message, uploading, attachments, props.editing])

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
		if (!props.editing) {
			let fileInput = document.getElementById("fileInput");
			await lq.sendMessage(message, [...attachments], mainContext.selectedChannel, props.replyTo);
			fileInput.value = "";
			setAttachments([]);
			props.setReplyTo(null);
		} else {
			await lq.editMessage(props.editing, mainContext.selectedChannel, message);
			props.setEditing(null);
		}
		setUploading(false);
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
		let newAttachments = [];
		for (let i = 0; i < items.length; i++) {
			if (items[i].type.indexOf("image") !== -1) {
				promises.push(new Promise((resolve) => {
					let blob = items[i].getAsFile();
					let reader = new FileReader();
					reader.readAsArrayBuffer(blob);
					reader.onload = () => {
						newAttachments.push({
							filename: blob.name,
							data: arrayBufferToBase64(reader.result),
							id: (Math.random() * 100000000000000000).toFixed(0)
						});
						resolve();
					}
				}))
			}
		}
		Promise.all(promises).then(() => {
			setAttachments(attachments => [...attachments, ...newAttachments]);
			evaluateSendDisabled();
		});
	}

	function handleFileChange(e) {
		// Add files to attachments
		let files = e.target.files;
		let promises = [];
		let newAttachments = [];
		for (let i = 0; i < files.length; i++) {
			promises.push(new Promise((resolve) => {
				let reader = new FileReader();
				reader.readAsArrayBuffer(files[i]);
				reader.onload = () => {
					newAttachments.push({
						filename: files[i].name,
						data: arrayBufferToBase64(reader.result),
						id: (Math.random() * 100000000000000000).toFixed(0)
					});
					resolve();
				}
			}))
		}
		Promise.all(promises).then(() => {
			setAttachments(attachments => [...attachments, ...newAttachments]);
			evaluateSendDisabled();
		});
	}

	function handleDrop(e) {
		e.preventDefault();
		let files = e.dataTransfer.files;
		let promises = [];
		let newAttachments = [];
		for (let i = 0; i < files.length; i++) {
			promises.push(new Promise((resolve) => {
				let reader = new FileReader();
				reader.readAsArrayBuffer(files[i]);
				reader.onload = () => {
					newAttachments.push({
						filename: files[i].name,
						data: arrayBufferToBase64(reader.result),
						id: (Math.random() * 100000000000000000).toFixed(0)
					});
					resolve();
				}
			}))
		}
		Promise.all(promises).then(() => {
			setAttachments(attachments => [...attachments, ...newAttachments]);
			evaluateSendDisabled();
		});
	}

	useEffect(() => {
		document.getElementById("messageTextInput").focus();
	}, [uploading])

	useEffect(() => {
		if (props.editing) {
			setMessage(props.messages.find(m => m.message._id === props.editing)?.message?.content || "");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.editing])

	// TODO: Display bot username in reply preview
	return (
		<div className="messageBox" onDrop={handleDrop}>
			{(props.replyTo && !props.editing) && <div className="messageBoxReply">
				<FontAwesomeIcon className="messageReplyIcon" icon={faReply} />
				<small className="messageReplyUsername">{props.messages.find(m => m.message._id === props.replyTo)?.author?.username || "Unknown User"}</small>
				<small className="messageReplyBody">{props.messages.find(m => m.message._id === props.replyTo)?.message?.content || "Unknown Message"}</small>
				<FontAwesomeIcon className="messageReplyCancel" onClick={() => {props.setReplyTo(undefined)}} icon={faX}></FontAwesomeIcon>
			</div>}
			{!props.editing && attachments.map(a => {
				return (
					<div className="messageBoxAttachment" key={a.id}>
						<FontAwesomeIcon className="messageAttachmentIcon" icon={faFile} />
						<small className="messageAttachmentFilename">{a.filename}</small>
						<FontAwesomeIcon className="messageAttachmentCancel" onClick={() => { setAttachments(p => p.filter(pa => pa.id !== a.id)) }} icon={faX}></FontAwesomeIcon>
					</div>
				)
				})
			}
			{props.editing &&
				<div className="messageBoxEditing">
					<FontAwesomeIcon className="messageEditingIcon" icon={faPencil} />
					<small className="messageEditingText">Editing a message</small>
					<FontAwesomeIcon className="messageEditingCancel" onClick={() => { props.setEditing(null) }} icon={faX}></FontAwesomeIcon>
				</div>
			}
			<input type="file" className="messageFile" hidden={true} multiple onChange={handleFileChange} name="file" id="fileInput"/>
			<textarea spellCheck={false} id="messageTextInput" onPaste={handlePaste} onKeyDown={handleMessageboxKey} disabled={uploading} className="messageInput" value={message} onInput={(e) => setMessage(e.target.value)} placeholder={uploading ? "Sending message..." : "Type your message here..."} />
			<div className={"messageAttachButton"} onClick={() => {document.querySelector("#fileInput").click();}}>
				<FontAwesomeIcon icon={faPaperclip}>Attach</FontAwesomeIcon>
			</div>
			<div className={sendDisabled ? "messageSendButton messageSendButtonDisabled" : "messageSendButton"} onClick={() => {send();}}>
				<FontAwesomeIcon icon={faPaperPlane}>Send</FontAwesomeIcon>
			</div>
		</div>
	);
}