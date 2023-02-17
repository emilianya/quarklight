//import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {AppContext} from "./contexts/AppContext";
import {Main} from "./components/Main";
import {lq} from "./classes/Lightquark";
import pjson from '../package.json';


function App() {
    const savedLoginState = localStorage.getItem("loggedIn") === "true" || false;
    let savedToken = localStorage.getItem("token");
    if (savedToken === "undefined") savedToken = undefined;
    if (savedToken === "null") savedToken = undefined;
    let [loggedIn, setLoggedIn] = useState(savedLoginState);
    let [token, setToken] = useState(savedToken);
    let [userData, setUserData] = useState(undefined);
    let [loading, setLoading] = useState(true);
    let [gatewayConnected, setGatewayConnected] = useState(false);
	let [spinnerText, setSpinnerText] = useState("Loading")
    let [quarks, setQuarks] = useState(undefined);
    let [channels, setChannels] = useState([]);
    let [userCache, setUserCache] = useState([]);
    let [channelCache, setChannelCache] = useState([]);


    useEffect(() => {
        localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
        localStorage.setItem("token", token);
        if (token) lq.setToken(token);
    }, [loggedIn, token]);

    return (
        <AppContext.Provider value={{
            loggedIn, setLoggedIn,
            token, setToken,
            userData, setUserData,
            loading, setLoading,
            gatewayConnected, setGatewayConnected,
            spinnerText, setSpinnerText,
            quarks, setQuarks,
            channels, setChannels,
            userCache, setUserCache,
            channelCache, setChannelCache,
            version: pjson.version
        }}>
            <Main/>
        </AppContext.Provider>
    );
}

export default App;
