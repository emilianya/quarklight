import {MessageBox} from "./MessageBox";
import {MessageView} from "./MessageView";

export function ContentContainer() {
	return (
		<div className="contentContainer">
			<MessageView />
			<MessageBox />
		</div>
	);
}