import { Tooltip } from 'react-tooltip'
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import { AppContext } from '../../contexts/AppContext';

export function Quark(props) {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext)
	let [showUnread, setShowUnread] = useState(false);
	let quark = props.quark;
	const { show } = useContextMenu({
		id: `${quark._id}_menu`,
	});

	useEffect(() => {
		let quarkChannelIds = quark.channels.map(c => c._id)
		let quarkHasUnreadChannel = mainContext?.unreadChannels?.some(id => quarkChannelIds.includes(id))
		setShowUnread(quarkHasUnreadChannel)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainContext.unreadChannels])

	function handleContextMenu(event){
		show({
			event,
			props: {
				key: 'value'
			}
		})
	}

	return (
		<div className="quarkBox">
			{showUnread ? <div className="unreadIndicatorQuark"></div> : null}
			<img onContextMenu={handleContextMenu} id={quark._id} data-tooltip-content={`${quark.name}`} onClick={() => props.setSelectedQuark(quark._id)} width={"48px"} height={"48px"} src={quark.iconUri} alt={quark.name} className="quarkImage" ></img>
			<Tooltip className="quarkTip" anchorId={quark._id} positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} />
			<Menu id={`${quark._id}_menu`} className="quarkMenu" theme={"dark"}>
				<Item disabled={true}><span>{quark.name}</span></Item>
				<Separator />
				<Item onClick={() => {
					mainContext.setSelectedQuark(null);
					lq.leaveQuark(quark._id)
				}} disabled={quark.owners.includes(appContext.userData._id)} className="leaveButton">Leave</Item>
				<Item onClick={() => navigator.clipboard.writeText(quark._id)}>Copy ID</Item>
			</Menu>
		</div>
	);
}