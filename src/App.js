import React, { useState } from "react";
import logo from "./logoblob.png"; // consider taking away the blue background from this logo
import "./App.css";

function App() {
  const options = [{
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
const [timer, setTimer] = useState(options[0].value);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to Ppalli!</p>
        <div class="selectholder">
          <form class="customSelect">
            <div class="select">
              <select
                id="notification-period"
                onChange={e => setTimer(e.target.value)}
              >
                {options.map((o) => (
                  <option value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <p>Your timer is set for every {timer} minutes.</p>
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
