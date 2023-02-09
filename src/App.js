//import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {LoginScreen} from "./screens/LoginScreen";
import {MainScreen} from "./screens/MainScreen";
import {AppContext} from "./contexts/AppContext";

function App() {
    const savedLoginState = localStorage.getItem("loggedIn") === "true" || false;
    const savedToken = localStorage.getItem("token");
    let [loggedIn, setLoggedIn] = useState(savedLoginState);
    let [token, setToken] = useState(savedToken);
    let [userData, setUserData] = useState(undefined);

    useEffect(() => {
        localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
        localStorage.setItem("token", token);
    });
    return (
        <AppContext.Provider value={{loggedIn, setLoggedIn, token, setToken, userData, setUserData}}>
            <div>
                <span>{loggedIn}</span>
                {!loggedIn ?  <LoginScreen/>
                           :  <MainScreen/>
                }
            </div>
        </AppContext.Provider>
    );
}

export default App;
