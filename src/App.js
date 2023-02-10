//import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {AppContext} from "./contexts/AppContext";
import {Main} from "./components/Main";

function App() {
    const savedLoginState = localStorage.getItem("loggedIn") === "true" || false;
    let savedToken = localStorage.getItem("token");
    if (savedToken === "undefined") savedToken = undefined;
    let [loggedIn, setLoggedIn] = useState(savedLoginState);
    let [token, setToken] = useState(savedToken);
    let [userData, setUserData] = useState(undefined);
    let [loading, setLoading] = useState(true);
    let [gatewayConnected, setGatewayConnected] = useState(false);
	let [spinnerText, setSpinnerText] = useState("Loading")

    useEffect(() => {
        localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
        localStorage.setItem("token", token);
    }, [loggedIn, token]);

    return (
        <AppContext.Provider value={{loggedIn, setLoggedIn, token, setToken, userData, setUserData, loading, setLoading, gatewayConnected, setGatewayConnected, spinnerText, setSpinnerText}}>        

            <Main/>
        </AppContext.Provider>
    );
}

export default App;
