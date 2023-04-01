import {useContext, useEffect} from "react";
import {MainContext} from "../../contexts/MainContext";
import {Tooltip} from "react-tooltip";
import joinQuark from "../../assets/joinQuark.png";
import createQuark from "../../assets/createQuark.png";
import {JoinModal} from "../modals/JoinModal";
import {CreateModal} from "../modals/CreateModal";

export function QuarkList() {
	let mainContext = useContext(MainContext);

	useEffect(() => {
		if (mainContext.showJoinModal && mainContext.showCreateModal) mainContext.setShowCreateModal(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},  [mainContext.showJoinModal])
	useEffect(() => {
		if (mainContext.showJoinModal && mainContext.showCreateModal) mainContext.setShowJoinModal(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},  [mainContext.showCreateModal])
	
	return (
		<div className="quarkList">
			{mainContext.quarkBoxes}

			<div className="quarkBox">
				<img id="joinQuark" data-tooltip-content="Join a Quark" onClick={() => {mainContext.setShowModal(p => p === "joinQuark" ? "" : "joinQuark")}} width={"48px"} height={"48px"} src={joinQuark} alt={"Join a Quark"} className="quarkImage"></img>
				<Tooltip className="quarkTip" anchorId="joinQuark" positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)", color: "var(--white)"}} />
			</div>
			<div className="quarkBox">
				<img id="createQuark" data-tooltip-content="Create a Quark" onClick={() => {mainContext.setShowModal(p => p === "createQuark" ? "" : "createQuark")}} width={"48px"} height={"48px"} src={createQuark} alt={"Create a Quark"} className="quarkImage"></img>
				<Tooltip className="quarkTip" anchorId="createQuark" positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)", color: "var(--white)"}} />
			</div>
			<JoinModal />
			<CreateModal />
		</div>
	);
}