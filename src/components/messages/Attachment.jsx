import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import {AppContext} from "../../contexts/AppContext";
import {useContext, useEffect, useState} from "react";

export function Attachment(props) {
	const appContext = useContext(AppContext);
	let [source, setSource] = useState(null);

	// Load image
	useEffect(() => {
		if (!props.attachment.type.startsWith("image")
		 && !props.attachment.type.startsWith("audio")
		 && !props.attachment.type.startsWith("video")) return;
		if (props.attachment.type === "audio/wave") return;
		const cachedFile = appContext.fileCache.find(f => f.url === props.attachment.url);
		if (cachedFile) {
			console.log("Using cached file")
			setSource(cachedFile.data);
			return;
		}
		(async () => {
			console.warn("Fetching new file");
			const data = await fetch(props.attachment.url);
			const blob = await data.blob();
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const base64data = reader.result;
				setSource(base64data);
				appContext.fileCache.push({url: props.attachment.url, data: base64data});
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (!props.attachment) return null;
	if (props.attachment.type.startsWith("image")) {
		return (
			<div>
				<img className="attachmentImage" onLoad={(e) => {
					let messageView = document.querySelector(".messageView");
					if (!props.scrollDetached) messageView.scrollTo(0, messageView.scrollHeight);
				}} src={source} alt="" />
				<a target="_blank" rel="noopener noreferrer" href={`${props.attachment.url}`}><FontAwesomeIcon icon={faDownload}/></a>
			</div>
		);
	}
	if (props.attachment.type.startsWith("video")) {
		return (
			<div>
				<video className="attachmentVideo" controls>
					<source src={props.attachment.url} type={props.attachment.type} />
				</video>
				<a target="_blank" rel="noopener noreferrer" href={`${props.attachment.url}`}><FontAwesomeIcon icon={faDownload}/></a>
			</div>
		);
	}

	if (props.attachment.type.startsWith("audio") && props.attachment.type !== "audio/wave") {
		return (
			<div>
				<audio className="attachmentAudio" controls>
					<source src={props.attachment.url} type={props.attachment.type} />
				</audio>
				<a target="_blank" rel="noopener noreferrer" href={`${props.attachment.url}`}><FontAwesomeIcon icon={faDownload}/></a>
			</div>
		);
	}

	return (
		<div>
			<div className="attachmentBox">
				<a target="_blank" rel="noopener noreferrer" href={props.attachment.url}>
					{props.attachment.name} - {props.attachment.size} <FontAwesomeIcon icon={faDownload}/>
				</a>
			</div>
		</div>
	);
}