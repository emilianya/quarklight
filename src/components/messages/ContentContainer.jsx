import {MessageBox} from "./MessageBox";
import {MessageView} from "./MessageView";
import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {AppContext} from "../../contexts/AppContext";
import {ChannelInfo} from "../channels/ChannelInfo";
import {WarningBanner} from "../WarningBanner";
import {MessageContext} from "../../contexts/MessageContext";

export function ContentContainer() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);
	let [messages, setMessages] = useState([]);
	let [replyTo, setReplyTo] = useState(null);
	let [editing, setEditing] = useState(null);
	let [scrollDetached, setScrollDetached] = useState(false);

	// This could cause problems, but I have no idea if it will
	useEffect(() => {
		if (appContext.channels.length === 0) {
			setMessages([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainContext.selectedQuark, mainContext.selectedChannel, appContext.quarks, appContext.channels])

	useEffect(() => {
		setReplyTo(undefined);
	}, [mainContext.selectedChannel]);

	useEffect(() => {
		lq.setMainContext(mainContext)
	}, [mainContext]);

	useEffect(() => {
		lq.setAppContext(appContext)
	}, [appContext]);

	useEffect(() => {
		lq.updateQuarkOrder();
	}, []);

	return (
		<MessageContext.Provider value={{
			messages: [messages, setMessages],
			replyTo: [replyTo, setReplyTo],
			editing: [editing, setEditing],
			scrollDetached: [scrollDetached, setScrollDetached]
		}}>
			<div className="contentContainer">
				<ChannelInfo channel={appContext.channels.find(c => c._id === mainContext.selectedChannel)} />
				<WarningBanner />
				<MessageView />
				<MessageBox />
			</div>
		</MessageContext.Provider>
	);
}