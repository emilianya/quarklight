import {useContext, useState} from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

export function AvatarModal() {
    let [avatar, setAvatar] = useState(null);
    let [avatarBin, setAvatarBin] = useState(null);
    let [mime, setMime] = useState(null);
    let [hovering, setHovering] = useState(false);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);

    function handleDrop (e) {
        console.log("Drop")
        e.preventDefault();
        setHovering(false);

        let file
        if (e?.dataTransfer?.files) {
            file = e.dataTransfer.files[0];
        } else {
            file = e.target.files[0];
        }


        if (file.size > 2097152) {
            setError("File is too large. Maximum size is 2MiB.");
            return;
        }

        setMime(file.type);

        let reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            setAvatar(reader.result);
        }

        (async () => {
            setAvatarBin(await file.arrayBuffer());
        })()
    }

    return (
		<div className="avatarModal" hidden={!(mainContext.showModal === "avatarUpload")}>
            <h2>Change avatar</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowModal(null)}} />

            { !avatar ? <div onClick={() => {
                document.getElementById("avatarInput").click();
            }} className="avatarUploadBox" style={{animation: hovering ? "shake 0.5s infinite" : "unset"}}
                 onDragOver={(e) => {e.preventDefault();setHovering(true)}}
                 onDragLeave={() => {setHovering(false)}}
                 onDrop={handleDrop}>
                <input id="avatarInput" type="file" onChange={handleDrop} hidden={true} />

                Drop your new avatar here or click to select a file.

            </div> : <img src={avatar} width={"200rem"} alt="Avatar" onLoad={(e) => {
                let ratio = e.target.width / e.target.height
                if (ratio !== 1) {
                    setError("Image must be square. (1:1 ratio)");
                    setAvatar(null);
                    setAvatarBin(null);
                } else {
                    setError(null)
                }
            }} className="avatarUploadPreview" /> }
            <br />
            <button className="button" onClick={() => setAvatar(null)}>Reset</button>
            <button className="button" onClick={async () => {
                if (avatar) {
                    let res = await lq.setAvatar(avatarBin, mime);
                    if (!res) {
                        mainContext.setShowModal(null);
                        mainContext.setWarning({
                            message: "Uploaded avatar might not be visible until you log out and back in.",
                            severity: "INFO",
                            severityColor: "#00bfff"
                        })
                    } else {
                        setError(res);
                    }
                } else {
                    setError("You must select an avatar before saving.");
                }
            }}>Save</button>

            <p style={{color: "red"}}>{error}</p>
        </div>
    )
}