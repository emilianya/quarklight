export function Attachment(props) {
	return (
		<div>
			{props.attachment.type.startsWith("image") ? <img src={props.attachment.uri} alt="" /> :
			<div className="attachmentBox">
				<a target="_blank" href={props.attachment.url}>
					{props.attachment.name} - {props.attachment.size}
				</a>
			</div>
			}
		</div>
	);
}