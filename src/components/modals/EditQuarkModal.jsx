import {useContext, useEffect, useState} from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

export function EditQuarkModal(props) {
    let [name, setName] = useState(null);
    let [invite, setInvite] = useState(null);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);

    useEffect(() => {
        setName(props.editingQuark?.name || "");
        setInvite(props.editingQuark?.invite || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainContext.showModal]);

    useEffect(() => {
        let filteredInvite = invite?.replace(/[^A-Za-z0-9-_.]/g, "-")?.toLowerCase();
        if (invite !== filteredInvite) setInvite(filteredInvite);
    }, [invite])


    return (
		<div className="channelEditModal" hidden={!(mainContext.showModal === "editQuark")}>
            <h2>Editing {props.editingQuark?.name}</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowModal(null)}} />
            <span>Quark name</span><br />
            <input type="text" className="input-box" onInput={(e) => {setName(e.target.value);setError(null)}} value={name || ""} placeholder="my quark" />
            <br />
            <span>Invite code</span><br />
            <input type="text" className="input-box" onInput={(e) => {setInvite(e.target.value);setError(null)}} value={invite || ""} placeholder="my-quark" />
            <br />
            <button className="button" onClick={async () => {
                if (!name) return setError("Enter a name for the quark");
                setName(name.trim());
                if (name.length > 64) return setError("Quark names must be 64 characters or less");
                let res = await lq.editQuark(props.editingQuark?._id, name, invite);
                // If there is no response, no changes were made
                if (!res) return mainContext.setShowModal(null);
                // If there is an error, display it otherwise assume the quark was edited successfully
                if (!res.error) {
                    mainContext.setShowModal(null);
                } else {
                    setError(res.error);
                }
                }}>Save changes</button>
            <p style={{color: "red"}}>{error}</p>
        </div>
    )
}