import {MessageBox} from "./MessageBox";
import {MessageView} from "./MessageView";
import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {AppContext} from "../../contexts/AppContext";
import {ChannelInfo} from "../channels/ChannelInfo";

export function ContentContainer() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);
	let [replyTo, setReplyTo] = useState(null);

	useEffect(() => {
		lq.setMainContext(mainContext)
	}, [mainContext]);

	useEffect(() => {
		lq.setAppContext(appContext)
	}, [appContext]);

	return (
		<div className="contentContainer">
			<ChannelInfo channel={appContext.channels.find(c => c._id === mainContext.selectedChannel)} />
			<MessageView setReplyTo={setReplyTo} />
			<MessageBox setReplyTo={setReplyTo} replyTo={replyTo} />
		</div>
	);
}