import {useContext, useEffect, useState} from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

export function EditChannelModal(props) {
    let [name, setName] = useState(null);
    let [description, setDescription] = useState(null);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);

    useEffect(() => {
        setName(props.editingChannel?.name || "");
        setDescription(props.editingChannel?.description || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainContext.showModal]);


    return (
		<div className="channelEditModal" hidden={!(mainContext.showModal === "editChannel")}>
            <h2>Editing #{props.editingChannel?.name}</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowModal(null)}} />
            <span>Channel name</span><br />
            <input type="text" className="input-box" onInput={(e) => {setName(e.target.value);setError(null)}} value={name || ""} placeholder="my channel" />
            <br />
            <span>Channel description</span><br />
            <input type="text" className="input-box input-box-wider" onInput={(e) => {setDescription(e.target.value);setError(null)}} value={description || ""} placeholder="talk here" />
            <br />
            <button className="button" onClick={async () => {
                if (!name) return setError("Enter a name for the channel");
                if (name.length > 64) return setError("Channel names must be 64 characters or less");
                let res = await lq.updateChannel(name, description, props.editingChannel?._id);
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