import {useContext} from "react";
import {MainContext} from "../../contexts/MainContext";

export function QuarkList() {
	let mainContext = useContext(MainContext);
	return (
		<div className="quarkList">
			{mainContext.quarkBoxes}
		</div>
	);
}