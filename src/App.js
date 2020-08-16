/*global chrome*/
import React, { useState } from "react";
import logo from "./assets/logo-ppalli.png";
import logo2 from "./assets/logo-pause-circle.png";
import "./App.css";
import { timeOptions } from "./constants/timeOptions";
import { activityOptions } from "./constants/activityOptions";

function App() {
  const extensionId = chrome.runtime.id;
  const [breakTimer, setBreakTimer] = useState(timeOptions[1].value);
  const [watchTimer, setWatchTimer] = useState(timeOptions[1].value);
  const [activity, setActivity] = useState(activityOptions[0].value);
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

  const setActivityOnChange = (e) => {
    setActivity(e.target.value);
    // chrome.runtime.sendMessage(
    //   extensionId,
    //   { message: "break", time: e.target.value },
    //   function (response) {
    //     console.log(response);
    //   }
    // );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo2} className="App-logo" alt="logo2" id="logo2" />
        <div>
        <img src={logo} className="App-logo" alt="logo" id="logo1"/>
        <hr class="solid"></hr>
        </div>
        <div id="main-body">
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
          <p>Your <strong>watch interval</strong> is set for every <strong>{watchTimer} minutes</strong>.</p>
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
          <p>Your <strong>break interval</strong> is set for every <strong>{breakTimer} minutes</strong>.</p>
        </div>
        <div className="subtitle">
          <p>Set your <strong>activity</strong></p>
          <hr class="solid"></hr>
        </div>
        <div id="main-body">
        {/* separate these option selectors into its own react component*/}
          <div className="selectholder">
            <form className="customSelect">
              <div className="select">
                <select
                  id="notification-period"
                  onChange={(e) => setActivityOnChange(e)}
                >
                  {activityOptions.map((o) => (
                    <option value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <p>On your next break, you plan to <strong>{activity}</strong>.</p>
        </div>
        <a
          className="button"
          href="https://tpi-ppalli.github.io/web-app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit our website!
        </a>
      </header>
    </div>
  );
}

export default App;