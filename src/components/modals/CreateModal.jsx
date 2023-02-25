import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

export function CreateModal() {
    let [name, setName] = useState(null);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);
    return (
		<div className="createModal" hidden={!mainContext.showCreateModal}>
            <h2>Create a Quark</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowCreateModal(false)}} />
            <p>Enter a name for your new Quark!</p>
            <input type="text" className="input-box" onInput={(e) => {setName(e.target.value);setError(null)}} placeholder="My awesome quark" />
            <br />
            <button className="button" onClick={async () => {
                if (!name) return setError("Please enter a name for your Quark");
                if (name.length > 64) return setError("Quark names must be 64 characters or less");
                let res = await lq.createQuark(name);
                if (!res.error) {
                    mainContext.setShowCreateModal(false);
                    mainContext.setSelectedQuark(res.quark._id);
                } else {
                    setError(res.error);
                }
                }}>Create!</button>
            <p style={{color: "red"}}>{error}</p>
        </div>
    )
}