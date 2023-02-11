import {useContext} from "react";
import {AppContext} from "../contexts/AppContext";

export function UserBox() {
	let appContext = useContext(AppContext);
	return (
		<div className="userBox">
			<img width={"48px"} className="avatar" src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
			<span className="username">{appContext?.userData?.username}</span><br />
			<span>subtext</span>
		</div>
	);
}