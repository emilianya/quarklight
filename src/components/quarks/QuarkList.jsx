import {useContext} from "react";
import {MainContext} from "../../contexts/MainContext";
import {Tooltip} from "react-tooltip";
import joinQuark from "../../assets/joinQuark.png";
import createQuark from "../../assets/createQuark.png";
import {JoinModal} from "../modals/JoinModal";

export function QuarkList() {
	let mainContext = useContext(MainContext);
	
	return (
		<div className="quarkList">
			{mainContext.quarkBoxes}

			<div className="quarkBox">
				<img id="joinQuark" data-tooltip-content="Join a Quark" onClick={() => {mainContext.setShowJoinModal(p => !p)}} width={"48px"} height={"48px"} src={joinQuark} alt={"Join a Quark"} className="quarkImage"></img>
				<Tooltip className="quarkTip" anchorId="joinQuark" positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} />
			</div>
			<div className="quarkBox">
				<img id="createQuark" data-tooltip-content="Create a Quark" onClick={() => {}} width={"48px"} height={"48px"} src={createQuark} alt={"Create a Quark"} className="quarkImage"></img>
				<Tooltip className="quarkTip" anchorId="createQuark" positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} />
			</div>
			<JoinModal />
		</div>
	);
}