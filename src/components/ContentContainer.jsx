import {useContext} from "react";
import {MainContext} from "../contexts/MainContext";

export function ContentContainer() {
	let mainContext = useContext(MainContext);
	return (
		<div className="contentContainer">

		</div>
	);
}