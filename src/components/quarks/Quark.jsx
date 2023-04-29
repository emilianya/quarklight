import { Tooltip } from 'react-tooltip'
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import {useContext, useEffect, useState} from "react";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import { AppContext } from '../../contexts/AppContext';

export function Quark(props) {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);
	let [showUnread, setShowUnread] = useState(false);
	//let [over, setOver] = useState(false);
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


	/*function onDragStartHandler(event) {
		event.dataTransfer.setData("quarkId", quark._id);
		console.log(mainContext.quarkOrder)
		if (!mainContext.quarkOrder) console.warn("Quark order is not set. This may cause unexpected behavior.")
		console.log("Drag started. Index in order: ", mainContext.quarkOrder.indexOf(event.dataTransfer.getData("quarkId")))
	}

	function onDragOverHandler(event) {
		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.setData("targetIndex", String(mainContext.quarkOrder.indexOf(quark._id)));
		console.log("Drag over. Index in order: ", mainContext.quarkOrder.indexOf(quark._id))
	}


	function onDropHandler(event) {
		if (!event.dataTransfer.getData("quarkId")) return;
		// Should the quark be dropped before or after the drop target?
		// Check if the mouse is above or below the center of the drop target
		const droppedBefore = (event.clientY - event.target.getBoundingClientRect().top) < event.target.getBoundingClientRect().height / 2;
		let draggedIndex = mainContext.quarkOrder.indexOf(event.dataTransfer.getData("quarkId"));
		// Update the order of the quarks
		console.log("Old order: ", mainContext.quarkOrder);

		let newQuarkOrder = [...mainContext.quarkOrder];

		//newQuarkOrder.splice(draggedIndex, 1); // remove the dragged element from the array
		let dropTargetIndex = mainContext.quarkOrder.indexOf(quark._id);
		let newIndex = dropTargetIndex;
		console.log("Drop target index: ", dropTargetIndex);
		console.log("Current index: ", draggedIndex);
		console.log("New index: ", newIndex);
		console.log("dataTransfer index: ", event.dataTransfer.getData("targetIndex"));
		//newQuarkOrder.splice(newIndex, 0, event.dataTransfer.getData("quarkId")); // add the dragged element back at the correct position

		array_move(newQuarkOrder, draggedIndex, newIndex)

		console.log("New order: ", newQuarkOrder);

		lq.updateQuarkOrder(newQuarkOrder).then((newOrder) => {
			event.dataTransfer.clearData();
			mainContext.setQuarkOrder(newOrder);
		});

	}*/


	/*// https://stackoverflow.com/a/5306832/9342273
	function array_move(arr, old_index, new_index) {
		while (old_index < 0) {
			old_index += arr.length;
		}
		while (new_index < 0) {
			new_index += arr.length;
		}
		if (new_index >= arr.length) {
			var k = new_index - arr.length + 1;
			while (k--) {
				arr.push(undefined);
			}
		}
		arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	}*/

	/**
	 * Move the quark up in the quark order
	 * @returns void
	 */
	/*function moveUp() {
		let draggedIndex = mainContext.quarkOrder.indexOf(quark._id);
		let newIndex = draggedIndex - 1;
		let newQuarkOrder = [...mainContext.quarkOrder];
		array_move(newQuarkOrder, draggedIndex, newIndex)
		mainContext.setQuarkOrder(newQuarkOrder);
		lq.setMainContext(mainContext);
		lq.updateQuarkOrder(newQuarkOrder);
	}

	function moveDown() {
		let draggedIndex = mainContext.quarkOrder.indexOf(quark._id);
		let newIndex = draggedIndex + 1;
		let newQuarkOrder = [...mainContext.quarkOrder];
		array_move(newQuarkOrder, draggedIndex, newIndex)
		mainContext.setQuarkOrder(newQuarkOrder);
		lq.setMainContext(mainContext);
		lq.updateQuarkOrder(newQuarkOrder);
	}*/

	return (
		<div className="quarkBox" /*onDragEnter={() => {setOver(true)}} onDragLeave={() => {setOver(false)}} onDragOver={onDragOverHandler} onDrop={onDropHandler} onDragStart={onDragStartHandler}*/>
			{showUnread/* || over*/ ? <div className="unreadIndicatorQuark"></div> : null}
			<img onContextMenu={handleContextMenu} id={quark._id} data-tooltip-content={`${quark.name}`} onClick={() => props.setSelectedQuark(quark._id)} width={"48px"} height={"48px"} src={quark.iconUri} alt={quark.name} className="quarkImage" ></img>
			<Tooltip className="quarkTip" anchorId={quark._id} positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)", color: "var(--white)"}} />
			<Menu id={`${quark._id}_menu`} className="quarkMenu" theme={"dark"}>
				<Item disabled={true}><span>{quark.name}</span></Item>
				<Separator />
				{/*mainContext?.quarkOrder?.indexOf(quark._id) !== 0 && <Item onClick={() => moveUp()}>Move up</Item>*/}
				{/*mainContext?.quarkOrder?.indexOf(quark._id) !== mainContext?.quarkOrder?.length - 1 && <Item onClick={() => moveDown()}>Move down</Item>*/}
				<Separator />
				<Item onClick={() => navigator.clipboard.writeText(quark.invite)}>Copy invite</Item>
				<Item onClick={() => navigator.clipboard.writeText(`lightquark://${quark._id}`)}>Copy Lightquark link</Item>
				<Item onClick={() => navigator.clipboard.writeText(`https://lq.litdevs.org/d/${quark._id}`)}>Copy web link</Item>

				<Item onClick={() => {
					mainContext.setSelectedQuark(null);
					lq.leaveQuark(quark._id)
				}} disabled={quark.owners.includes(appContext.userData._id)} className="leaveButton">Leave</Item>

				{quark.owners.includes(appContext.userData._id) &&
					<>
						<Item onClick={() => {
							
						}} className="editQuarkButton">Edit</Item>
						<Item onClick={() => {
							if (!window.confirm("Are you sure you want to delete this quark?")) return;
							if (!window.confirm("Are you REALLY sure?")) return;
							if (mainContext.selectedQuark === quark._id) mainContext.setSelectedQuark(null);
							lq.deleteQuark(quark._id)
						}} className="deleteButton">Delete</Item>
					</>
				}
				<Item onClick={() => navigator.clipboard.writeText(quark._id)}>Copy ID</Item>
			</Menu>
		</div>
	);
}