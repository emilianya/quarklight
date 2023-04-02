import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {MainContext} from "../../contexts/MainContext";
import {AppContext} from "../../contexts/AppContext";
import {useContext, useEffect, useState} from "react";
import Toggle from "../settings/Toggle";
import {UserBox} from "../nav/UserBox";
import settings from "../../classes/Settings";

export default function SettingsScreen() {
	let mainContext = useContext(MainContext);
	let appContext= useContext(AppContext);
	let [plainText, setPlainText] = useState(appContext.preferences.usePlainText);
	let [showModifiedToggle, setShowModifiedToggle] = useState(appContext.preferences.ql_showModifiedToggle);
	let [notificationsEnabled, setNotificationsEnabled] = useState(appContext.preferences.notificationsEnabled);
	let [tab, setTab] = useState(0);

	useEffect(() => {
		settings.settings.usePlainText = plainText;
	}, [plainText]);

	useEffect(() => {
		settings.settings.ql_showModifiedToggle = showModifiedToggle;
	}, [showModifiedToggle]);

	useEffect(() => {
		settings.settings.notificationsEnabled = notificationsEnabled;
	}, [notificationsEnabled]);

	return (
		<div className="settingsContainer">
			<div className="settingsHeader">
				<FontAwesomeIcon icon={faX} className="closeButton" onClick={() => { mainContext.setScreen("primary") }} />
				<h3>Settings</h3>
				<div className="settingsUserBox">
					<UserBox />
				</div>
			</div>
			<div className="settingTabContainer">
				<div className="settingTabBar">
					<div className={tab === 0 ? "settingTab settingTabActive" : "settingTab"}
					     onClick={() => {setTab(0)}}>
						General
					</div>
					<div className={tab === 1 ? "settingTab settingTabActive" : "settingTab"}
					     onClick={() => {setTab(1)}}>
						Notifications
					</div>
					<div className={tab === 2 ? "settingTab settingTabActive" : "settingTab"}
						 onClick={() => {setTab(2)}}>
						Appearance
					</div>
				</div>
				<div className="settingTabContent">
					{ tab === 0 && (<>
						<div className="setting">
							<span style={{fontWeight: "600"}}>Show plain text message</span>
							<br />
							<span style={{fontSize: "0.9rem"}}>Show unmodified version of messages when available. If this is enabled you are not able to see any text modifiers.</span>
							<br />
							<Toggle checked={plainText} setChecked={setPlainText} />
						</div>
						<div className="setting">
							<span style={{fontWeight: "600"}}>Show {plainText ? "modified" : "original"} toggle</span>
							<br />
							<span style={{fontSize: "0.9rem"}}>Show a button to show the {plainText ? "modified" : "original"} version of a message</span>
							<br />
							<Toggle checked={showModifiedToggle} setChecked={setShowModifiedToggle} />
						</div>
					</>)}
					{ tab === 1 && (<>
						<div className="setting">
							<span style={{fontWeight: "600"}}>Notifications</span>
							<br />
							<span style={{fontSize: "0.9rem"}}>Send notifications for new messages in other channels, or while unfocused</span>
							<br />
							<Toggle checked={notificationsEnabled} setChecked={setNotificationsEnabled} />
						</div>
					</>)}
					{ tab === 2 && (<>
						<div className="setting">
							<span style={{fontWeight: "600"}}>Theme</span>
							<br />
							<span style={{fontSize: "0.9rem"}}>Customize how Quarklight looks. Note: If the theme does not immediately change, try restarting Quarklight.</span>
							<br />
							<select className="themeSelector" value={appContext.preferences.ql_theme} onChange={(e) => {
								settings.settings.ql_theme = e.target.value;
							}}>
								<option value="dark">Dark</option>
								<option value="light">Light</option>
							</select>
						</div>
					</>)}
				</div>
			</div>
		</div>
	);
}