import {useContext} from "react";
import {MainContext} from "../contexts/MainContext";
import {AppContext} from "../contexts/AppContext";

export function QuarkInfo() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);
	if (!mainContext.selectedQuark) return (<span></span>);
	return (
		<span style={{margin: "0 auto", fontWeight: "500", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "13rem"}}>{appContext.quarks.find(q => q._id === mainContext.selectedQuark).name}</span>
	);
}