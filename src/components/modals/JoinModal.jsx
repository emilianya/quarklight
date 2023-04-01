import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { lq } from '../../classes/Lightquark';
import { Tooltip } from 'react-tooltip';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

export function JoinModal() {
    let [quark, setQuark] = useState(null);
    let [inviteCode, setInviteCode] = useState(null);
    let [error, setError] = useState(null);
    let mainContext = useContext(MainContext);
    return (
		<div className="joinModal" hidden={!(mainContext.showModal === "joinQuark")}>
            <h2>Join a Quark</h2>
            <FontAwesomeIcon icon={faX} className="closeButton" onClick={() => {mainContext.setShowModal(null)}} />
            <p>Enter the invite code for a Quark you would like to join!</p>
            <input type="text" className="input-box" onInput={(e) => {setInviteCode(e.target.value);setError(null)}} placeholder="Invite Code" />
            <br />
            <button className="button" onClick={async () => {
                let res = await lq.checkInvite(inviteCode);
                if (res.valid && !res.alreadyMember) {
                    setQuark(res.quark);
                } else {
                    setQuark(null);
                    if (!res.valid) setError("Invalid invite code")
                    if (res.alreadyMember) setError("You are already a member of that Quark")
                }
                }}>Check invite</button>
            <p style={{color: "red"}}>{error}</p>
            <p hidden={!!!quark}>A Quark was found for that invite code! Is this the one you want to join?</p>
            <div className="joinModalQuark" hidden={!!!quark}>
                <img src={quark?.iconUri} alt="" className="joinModalQuarkIcon" />
                <span id="joinName" data-tooltip-content={quark?.name} className="joinModalQuarkName">{quark?.name}</span><br />
                <Tooltip className="quarkTip" anchorId="joinName" place={"bottom"} style={{opacity: 1, backgroundColor: "var(--tooltip)", color: "var(--white)"}} />
                <span className="joinModalQuarkDetail">{quark?.members?.length} Members {quark?.channels?.length} Channels</span>
                <button className="button joinModalQuarkJoinButton" onClick={() => {
                    lq.joinQuark(inviteCode);
                    mainContext.setShowModal(null);
                }}>Join</button>
            </div>
        </div>
    )
}