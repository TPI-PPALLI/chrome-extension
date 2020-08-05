/*global chrome*/
import React, { useState } from "react";
import logo from "./logoblob.png"; // consider taking away the blue background from this logo
import "./App.css";

function App() {
  const timeOptions = [
    {
      label: "15 minutes",
      value: 15,
    },
    {
      label: "30 minutes",
      value: 30,
    },
    {
      label: "45 minutes",
      value: 45,
    },
    {
      label: "60 minutes",
      value: 60,
    },
  ];

  const extensionId = 'onpbgkkoaomobjbkfbnkabeokcbebhcl';
  // function getExtensionId() {
  //   window.postMessage({ type: "GET_EXTENSION_ID" }, "*");
  // }

  // useEffect(() => {
  //   // Set up event listeners from Content script
  //   getExtensionId();
  //   window.addEventListener("message", function (event) {
  //     if (event.source !== window) return;
  //     if (event.data.type && event.data.type === "EXTENSION_ID_RESULT") {
  //       setExtensionId(event.data.extensionId);
  //       console.log("inside if" + extensionId);
  //     }
  //     console.log("outside if" + extensionId);
  //   });
  // }, []);

  const [breakTimer, setBreakTimer] = useState(timeOptions[0].value);
  const [watchTimer, setWatchTimer] = useState(timeOptions[0].value);
  const setWatchOnChange = (e) => {
    setWatchTimer(e.target.value);
    chrome.runtime.sendMessage(extensionId, { message: "watch", time: e.target.value }, function (response) {
      console.log(response);
    })
  };

  const setBreakOnChange = (e) => {
    setBreakTimer(e.target.value);
    chrome.runtime.sendMessage(extensionId, { message: "break", time: e.target.value }, function (response) {
      console.log(response);
    })
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
