//import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {LoginScreen} from "./screens/LoginScreen";
import {MainScreen} from "./screens/MainScreen";
import {Loader} from "./screens/Loader";
import {AppContext} from "./contexts/AppContext";

function App() {
    const savedLoginState = localStorage.getItem("loggedIn") === "true" || false;
    const savedToken = localStorage.getItem("token");
    let [loggedIn, setLoggedIn] = useState(savedLoginState);
    let [token, setToken] = useState(savedToken);
    let [userData, setUserData] = useState(undefined);
    let [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
        localStorage.setItem("token", token);
    });

    /*useEffect(() => {
        if (userData) setLoading(false);
    }, [userData]);*/
    return (
        <AppContext.Provider value={{loggedIn, setLoggedIn, token, setToken, userData, setUserData, loading, setLoading}}>
            <div>
                {loading ? <Loader/> : ""}
                {!loggedIn && !loading ? <LoginScreen/> : ""}
                {loggedIn && !loading ? <MainScreen/> : ""}
            </div>
        </AppContext.Provider>
    );
}

export default App;
