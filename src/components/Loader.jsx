import {useState, useContext, useEffect} from "react";
import {AppContext} from "../contexts/AppContext";
import spinner from "../assets/spinner_test_gif.gif";

export function Loader(props) {
	let appContext = useContext(AppContext);
	let [seconds, setSeconds] = useState(0);
	let [spinnerText, setSpinnerText] = useState("Loading")

	useEffect(() => {
		if (!appContext.userData) return setSpinnerText("Loading user data")
		if (!appContext.gatewayConnected) return setSpinnerText("Connecting to gateway")
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
			<p className="spinnerSubtitle">{spinnerText}{".".repeat(3 + seconds)}</p>
		</div>
	);
}