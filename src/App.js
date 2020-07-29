import React from 'react';
import logo from './logoblob.png'; // consider taking away the blue background from this logo
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome to Ppalli!
        </p>
        <div class = "selectholder">
          <form action="#" class="customSelect">
            <div class="select">
              <select id="notification-period">
                <option value={15}> 15 minutes</option>
                <option value={30}> 30 minutes</option>
                <option value={45}> 45 minutes</option>
                <option value={60}> 60 minutes</option>
              </select>
            </div>
          </form>
        </div> 
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
