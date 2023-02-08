//import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {LoginScreen} from "./screens/LoginScreen";
import {MainScreen} from "./screens/MainScreen";

function App() {
    const savedLoginState = localStorage.getItem("isLoggedIn") === "true" || false;
    const savedToken = localStorage.getItem("token");
    let [isLoggedIn, setIsLoggedIn] = useState(savedLoginState);
    let [getToken, setToken] = useState(savedToken);

    useEffect(() => {
        localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
        localStorage.setItem("token", getToken);
    });
    return (
        <div>
            <span>{isLoggedIn}</span>
            {!isLoggedIn ?  <LoginScreen loginState={{isLoggedIn, setIsLoggedIn}} tokenState={{setToken, getToken}}/>
                         :  <MainScreen  loginState={{isLoggedIn, setIsLoggedIn}} tokenState={{setToken, getToken}}/>
            }

        </div>
    );
}

export default App;
