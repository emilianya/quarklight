import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

export function AddChannelModal() {
    let [name, setName] = useState(null);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);
    return (
		<div className="addModal" hidden={!(mainContext.showModal === "addChannel")}>
            <h2>Add a channel</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowModal(null)}} />
            <p>Name:</p>
            <input type="text" className="input-box" onInput={(e) => {setName(e.target.value);setError(null)}} placeholder="my channel" />
            <br />
            <button className="button" onClick={async () => {
                if (!name) return setError("Enter a name for the channel");
                if (name.length > 64) return setError("Channel names must be 64 characters or less");
                let res = await lq.createChannel(name, mainContext.selectedQuark);
                if (!res.error) {
                    mainContext.setShowModal(null);
                    mainContext.setSelectedChannel(res.channel._id);
                } else {
                    setError(res.error);
                }
                }}>Create!</button>
            <p style={{color: "red"}}>{error}</p>
        </div>
    )
}