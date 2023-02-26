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
	let [messages, setMessages] = useState([]);
	let [replyTo, setReplyTo] = useState(null);
	let [editing, setEditing] = useState(null);

	useEffect(() => {
		setReplyTo(undefined);
	}, [mainContext.selectedChannel]);

	useEffect(() => {
		lq.setMainContext(mainContext)
	}, [mainContext]);

	useEffect(() => {
		lq.setAppContext(appContext)
	}, [appContext]);

	return (
		<div className="contentContainer">
			<ChannelInfo channel={appContext.channels.find(c => c._id === mainContext.selectedChannel)} />
			<MessageView messages={messages} setEditing={setEditing} editing={editing} setMessages={setMessages} replyTo={replyTo} setReplyTo={setReplyTo} />
			<MessageBox messages={messages} setEditing={setEditing} editing={editing} setReplyTo={setReplyTo} replyTo={replyTo} />
		</div>
	);
}