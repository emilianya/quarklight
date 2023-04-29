import {useState, useContext, useEffect} from "react";
import {AppContext} from "../../contexts/AppContext";
import spinner from "../../assets/spinner_test_gif.gif";
import {lq} from "../../classes/Lightquark";

export function Loader() {
	let appContext = useContext(AppContext);
	let [seconds, setSeconds] = useState(0);

	useEffect(() => {
		if (!appContext.userData) return appContext.setSpinnerText("Loading user data")
		if (!appContext.quarks) return appContext.setSpinnerText("Loading quarks")
		if (!appContext.gatewayConnected && !lq.reconnecting) return appContext.setSpinnerText("Connecting to gateway")
	
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appContext.userData, appContext.gatewayConnected]);

	useEffect(() => {
		let startTime = Date.now();
		let spinnerInterval = setInterval(() => {
			setSeconds(Math.floor((Date.now() - startTime) / 1000));
		}, 1000)
		return () => clearInterval(spinnerInterval);
	}, [])
	return (
		<div className="loaderRoot" data-testid="loaderRoot">
			<img alt="3 circles spinning" src={spinner} className="spinner" data-testid="spinner"></img>
			<p className="spinnerSubtitle" data-testid="spinnerSubtitle">{appContext.spinnerText}{".".repeat(Math.min(3 + seconds, 12))}</p>
		</div>
	);
}