import {useContext} from "react";
import {MainContext} from "../../contexts/MainContext";
import {AppContext} from "../../contexts/AppContext";

export function QuarkInfo() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);
	if (!mainContext.selectedQuark) return (<span className="quarkTitle"></span>);
	return (
		<span className="quarkTitle">{appContext.quarks.find(q => q._id === mainContext.selectedQuark).name}</span>
	);
}