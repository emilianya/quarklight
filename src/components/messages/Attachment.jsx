import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

export function Attachment(props) {
	if (!props.attachment) return null;
	if (props.attachment.type.startsWith("image")) {
		return (
			<div>
				<img className="attachmentImage" onLoad={() => {
					let messageView = document.querySelector(".messageView");
					if (!props.scrollDetached) messageView.scrollTo(0, messageView.scrollHeight);
				}} src={props.attachment.url} alt="" />
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