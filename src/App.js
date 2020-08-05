/*global chrome*/
import React, { useState, useEffect } from "react";
import logo from "./logoblob.png"; // consider taking away the blue background from this logo
import "./App.css";
import { timeOptions } from "./constants/timeOptions";

function App() {
  const extensionId = chrome.runtime.id;
  const [breakTimer, setBreakTimer] = useState(timeOptions[0].value);
  const [watchTimer, setWatchTimer] = useState(timeOptions[0].value);
  const setWatchOnChange = (e) => {
    setWatchTimer(e.target.value);
    chrome.runtime.sendMessage(
      extensionId,
      { message: "watch", time: e.target.value },
      function (response) {
        console.log(response);
      }
    );
  };

  const setBreakOnChange = (e) => {
    setBreakTimer(e.target.value);
    chrome.runtime.sendMessage(
      extensionId,
      { message: "break", time: e.target.value },
      function (response) {
        console.log(response);
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to Ppalli!</p>
        <p>{extensionId}</p>
        {/* separate these option selectors into its own react component*/}
        <div className="selectholder">
          <form className="customSelect">
            <div className="select">
              <select
                id="notification-period"
                onChange={(e) => setWatchOnChange(e)}
              >
                {timeOptions.map((o) => (
                  <option value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <p>Your watch interval is set for every {watchTimer} minutes.</p>
        <div className="selectholder">
          <form className="customSelect">
            <div className="select">
              <select
                id="notification-period"
                onChange={(e) => setBreakOnChange(e)}
              >
                {timeOptions.map((o) => (
                  <option value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <p>Your break interval is set for every {breakTimer} minutes.</p>
        <a
          className="button"
          href="https://tpi-ppalli.github.io/web-app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit us
        </a>
      </header>
    </div>
  );
}

export default App;
