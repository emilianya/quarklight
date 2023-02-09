import {useState, useContext, useEffect} from "react";
import {AppContext} from "../contexts/AppContext";
import spinner from "../assets/spinner_test_gif.gif";

export function Loader(props) {
	let appContext = useContext(AppContext);
	let startTime = Date.now();
	let [seconds, setSeconds] = useState(0);
	useEffect(() => {
		setInterval(() => {
			setSeconds(Math.floor((Date.now() - startTime) / 1000));
		}, 1000)
	}, [startTime])
	return (
		<div className="loaderRoot">
			<img src={spinner} className="spinner"></img>
			<p className="spinnerSubtitle">Loading{".".repeat(3 + seconds)}</p>
		</div>
	);
}