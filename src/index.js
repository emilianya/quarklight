import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-tooltip/dist/react-tooltip.css'
import 'react-contexify/ReactContexify.css';
import { lq } from './classes/Lightquark';

try {
  const { ipcRenderer } = window.require("electron");
  
  ipcRenderer.on("open-url", (event, url) => {
      lq.openLqLink(url);
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
