import React, {useState, useContext} from 'react'
import {render} from '@testing-library/react'
import {AppContext} from "../contexts/AppContext";
import {lq} from "../classes/Lightquark";
import pjson from "../../package.json";

const AllTheProviders = ({children}) => {
	let [loggedIn, setLoggedIn] = useState(false);
	let [token, setToken] = useState(undefined);
	let [userData, setUserData] = useState(undefined);
	let [loading, setLoading] = useState(true);
	let [gatewayConnected, setGatewayConnected] = useState(false);
	let [spinnerText, setSpinnerText] = useState("Loading")
	let [quarks, setQuarks] = useState([]);
	let [channels, setChannels] = useState([]);
	let [userCache, setUserCache] = useState([]);
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
			version: pjson.version}}>
			<>{lq.setAppContext(useContext(AppContext))}</>
			{children}
		</AppContext.Provider>
	)
}

const customRender = (ui, options) =>
	render(ui, {wrapper: AllTheProviders, ...options})

// re-export everything
export * from '@testing-library/react'

// override render method
export {customRender as render}