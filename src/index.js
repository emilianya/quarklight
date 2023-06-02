import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-tooltip/dist/react-tooltip.css'
import 'react-contexify/ReactContexify.css';
import { lq } from './classes/Lightquark';
import { FlagProvider } from '@unleash/proxy-client-react';
import pjson from '../package.json';

export let environment = pjson.channel === "stable" ? "production" : "development";
console.info("Environment: " + environment)
let unleashKey
if (environment === "production") {
  unleashKey = "default:production.2365aa01274468ff4b7250d5105fbdd159774000b10d169d82fcb097"
} else {
  unleashKey = "default:development.5974ed46a9c0dbf2b29b89c9377cf05d36625749eef0b8f49b2a2119"
}

let unleashConfig = {
  url: 'https://feature-gacha.litdevs.org/api/frontend', // Your front-end API URL or the Unleash proxy's URL (https://<proxy-url>/proxy)
  clientKey: unleashKey, // A client-side API token OR one of your proxy's designated client keys (previously known as proxy secrets)
  refreshInterval: 60, // How often (in seconds) the client should poll the proxy for updates
  appName: 'Quarklight', // The name of your application. It's only used for identifying your application
  environment
};

try {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer.on("open-url", (event, url, p2) => {
        if (!url.includes("/")) {
            // I have no idea why updates also come to this one, and in the wrong format, but handle it
            return lq.updateAvailable(url, () => {
                ipcRenderer.invoke("restart");
            });
        }
        lq.openLqLink(url);
    })

    // Receive the isDev flag from electron
    ipcRenderer.on("is-dev", (event, dev) => {
        lq.isDev = dev;
    })

    ipcRenderer.on("update-available", (event, eventData) => {
        console.log("ipcRenderer received update-available event with url: " + eventData.releaseName)
        lq.updateAvailable(eventData.releaseName, eventData.callback);
    })

} catch (e) {
  console.log("Not running in electron, ignoring links.")
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FlagProvider config={unleashConfig}>
      <App />
    </FlagProvider>
  </React.StrictMode>
);
