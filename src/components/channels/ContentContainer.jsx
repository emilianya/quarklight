import {useContext} from "react";
import {MainContext} from "../../contexts/MainContext";
import {AppContext} from "../../contexts/AppContext";

export function ContentContainer() {
	let mainContext = useContext(MainContext);
	let appContext = useContext(AppContext);
	return (
		<div className="contentContainer">
			Server: {mainContext.selectedQuark}<br/>
			Members in {appContext.quarks.find(q => q._id === mainContext.selectedQuark).name}: <br/>
			{JSON.stringify(appContext.quarks.find(q => q._id === mainContext.selectedQuark)?.members?.map(m => m.username)).replaceAll(",", ", ")}
		</div>
	);
}