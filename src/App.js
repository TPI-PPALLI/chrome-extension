/*global chrome*/
import React, { useState } from "react";
import logo from "./logoblob.png"; // consider taking away the blue background from this logo
import "./App.css";

function App() {
  const timeOptions = [{
    label: '15 minutes',
    value: 15,
  },
  {
    label: '30 minutes',
    value: 30,
  },
  {
    label: '45 minutes',
    value: 45,
  },
  {
    label: '60 minutes',
    value: 60,
  },
];
  const [breakTimer, setBreakTimer] = useState(timeOptions[0].value);
  const [watchTimer, setWatchTimer] = useState(timeOptions[0].value);
  const setWatchOnChange = (e) => {
    setWatchTimer(e.target.value);
    // chrome.runtime.sendMessage("break_" + breakTimer.toString(), function (response) {
    //   console.log(response);
    // })
  }
  const setBreakOnChange = (e) => {
    setBreakTimer(e.target.value);
    /*
    const extensionId = (chrome.runtime.id).toString();
    console.log(extensionId);
    chrome.runtime.sendMessage(extensionId, "break_" + breakTimer.toString(), function (response) {
      console.log(response);
    })
    */
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to Ppalli!</p>
        {/* separate these option selectors into its own react component*/}
        <div class="selectholder">
          <form class="customSelect">
            <div class="select">
              <select
                id="notification-period"
                onChange={e => setWatchOnChange(e)}
              >
                {timeOptions.map((o) => (
                  <option value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <p>Your watch interval is set for every {watchTimer} minutes.</p>
        <div class="selectholder">
          <form class="customSelect">
            <div class="select">
              <select
                id="notification-period"
                onChange={e => setBreakOnChange(e)}
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
          class="button"
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
