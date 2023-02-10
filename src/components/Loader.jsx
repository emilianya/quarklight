import {useState, useContext, useEffect} from "react";
import {AppContext} from "../contexts/AppContext";
import spinner from "../assets/spinner_test_gif.gif";
import {lq} from "../classes/Lightquark";

export function Loader(props) {
	let appContext = useContext(AppContext);
	let [seconds, setSeconds] = useState(0);

	useEffect(() => {
		if (!appContext.userData) return appContext.setSpinnerText("Loading user data")
		if (!appContext.gatewayConnected && !lq.reconnecting) return appContext.setSpinnerText("Connecting to gateway")
	}, [appContext.userData, appContext.gatewayConnected]);

	useEffect(() => {
		let startTime = Date.now();
		setInterval(() => {
			setSeconds(Math.floor((Date.now() - startTime) / 1000));
		}, 1000)
	}, [])
	return (
		<div className="loaderRoot">
			<img src={spinner} className="spinner"></img>
			<p className="spinnerSubtitle">{appContext.spinnerText}{".".repeat(3 + seconds)}</p>
		</div>
	);
}