import {useContext, useEffect, useState} from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {AppContext} from "../../contexts/AppContext";

export function NickModal() {
    let [name, setName] = useState(null);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);
    let appContext = useContext(AppContext);

    useEffect(() => {
        if (mainContext.showModal === "editNick") {
            setName(mainContext.nickname);
        }
        if (mainContext.showModal === "editQuarkNick") {
            setName(mainContext.quarkNickname);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainContext.showModal]);


    return (
		<div className="nickModal" hidden={!(mainContext.showModal === "editNick" || mainContext.showModal === "editQuarkNick")}>
            <h2>Change nickname{mainContext.showModal === "editQuarkNick" ? ` in ${appContext.quarks.find(q => q._id === mainContext.selectedQuark).name}` : ""}</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowModal(null)}} />
            <p>Nickname:</p>
            <input type="text" className="input-box" onInput={(e) => {setName(e.target.value);setError(null)}} value={name || ""} placeholder="user123" />
            <br />
            <button className="button" onClick={async () => {
                if (name.length > 32) return setError("Nicknames must be 32 characters or less");
                let res = await lq.setNickname(name, mainContext.showModal === "editQuarkNick" ? mainContext.selectedQuark : "global");
                if (!res) {
                    mainContext.setShowModal(null);
                } else {
                    setError(res.error);
                }
                }}>Save</button>
            <p style={{color: "red"}}>{error}</p>
        </div>
    )
}