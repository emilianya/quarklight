import {useContext, useEffect} from "react";
import {AppContext} from "../../contexts/AppContext";
import {MainContext} from "../../contexts/MainContext";
import {lq} from "../../classes/Lightquark";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {NickModal} from "../modals/NickModal";
import {AvatarModal} from "../modals/AvatarModal";

export function UserBox() {
	let appContext = useContext(AppContext);
	let mainContext = useContext(MainContext);

	useEffect(() => {
		(async () => {
			let nick = await lq.getNickname();
			if (nick) mainContext.setNickname(nick);
			//console. log("Set nickname to " + nick)
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		(async () => {
			let nick;
			if (mainContext.selectedQuark) nick = await lq.getNickname(mainContext.selectedQuark)
			else return;
			if (nick) mainContext.setQuarkNickname(nick);
			//console. log("Set Qnickname to " + nick, mainContext.selectedQuark)
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainContext.selectedQuark]);



	return (
		<div className="userBox">
			<img width={"48px"} onClick={() => {mainContext.setShowModal(p => p === "avatarUpload" ? "" : "avatarUpload")}} className="avatar" src={appContext?.userData?.avatar || "https://quarky.vukky.net/assets/img/loading.png"} alt=""/>
			<span className="username">{mainContext?.nickname || appContext?.userData?.username}</span>
			<FontAwesomeIcon icon={faPencil} className="editNickButton" onClick={() => {mainContext.setShowModal(p => p === "editNick" ? "" : "editNick")}} />
			<br />
			<span>{mainContext?.quarkNickname}</span>
			<FontAwesomeIcon icon={faPencil} className="editNickButton" onClick={() => {mainContext.setShowModal(p => p === "editQuarkNick" ? "" : "editQuarkNick")}} />
			<NickModal />
			<AvatarModal />
		</div>
	);
}