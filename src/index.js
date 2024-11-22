import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-tooltip/dist/react-tooltip.css'
import 'react-contexify/ReactContexify.css';
import { lq } from './classes/Lightquark';
import pjson from '../package.json';

export let environment = pjson.channel === "stable" ? "production" : "development";
console.info("Environment: " + environment)

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
      <App />
  </React.StrictMode>
);
