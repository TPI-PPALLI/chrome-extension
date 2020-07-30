
/*global chrome*/
// timer is done here so we could potentially manage multiple tabs
let strikeURL = "https://tpi-ppalli.github.io/web-app/"; // where to redirect when strike is accepted
let strikeCount = 1;
let strikeOut = false;

// in milliseconds
let breakInterval = 6000; // 30min is 1800000
let watchInterval = 10000;
let pauseInterval = 5000;

let stoppedWatching = false;
let timerStarted = false;

// define timer class
let Timer = function(callback, time) {
    let timerID;
    let remaining = time;
    let start;
    let running = false; // track if timer is running

    this.stop = function() {
        window.clearTimeout(timerID);
        running = false;
        remaining = time;
    }
    this.start = function() {
        window.clearTimeout(timerID);
        start = Date.now();
        timerID = window.setTimeout(callback, time);
        running = true;
        remaining = time;
    }
    this.pause = function() {
        window.clearTimeout(timerID);
        remaining -= Date.now() - start;
        //alert(remaining);
        running = false;
    };
    this.resume = function() {
        start = Date.now();
        window.clearTimeout(timerID);
        timerID = window.setTimeout(callback, remaining);
        //alert(remaining);
        running = true;
    };
    this.isRunning = function() {
        return running;
    }
    this.setRunning = function(state) {
        running = state;
    }
    this.getTimestamp = function() {
        this.pause();
        this.resume();
        return remaining;
    }
}

let runTimer = false;


// set timers to call each other recursively
let watchTimer = new Timer(function () {
    watchTimer.setRunning(false);
    messageContent("open_popup" + strikeCount); // send message to content.js to open popup
    breakTimer.start();
}, watchInterval);


let breakTimer = new Timer(function () {
    breakTimer.setRunning(false);
    messageContent("close_popup" + strikeCount);
    if (strikeOut) {
        messageContent("close_strikeout");
        strikeOut = false;
    }
    strikeCount = 1; // reset strike count upon successful break completion
    if (!stoppedWatching) {
        watchTimer.start();
    } else {
        timerStarted = false;
        pauseTimer.start();
    }
}, breakInterval);


// if watch timer is running but you switch tabs out of youtube, reset timers after pauseInterval
let pauseTimer = new Timer(function () {
    pauseTimer.setRunning(false);
    watchTimer.stop();
    breakTimer.stop();
    timerStarted = false;
    stoppedWatching = true;
    strikeCount = 1;
}, pauseInterval)


// END OF GLOBAL VARIABLES


// cannot call from content.js so need to call here
function redirect() {
    chrome.tabs.create({url: strikeURL});
}


// helper to message content.js
function messageContent(message) {
    chrome.tabs.query({url: "*://*.youtube.com/*"}, function (tabs) { // send message to all tabs with youtube url
        tabs.forEach(function(tab) {
            if (message == "open_popup" + strikeCount){
                chrome.tabs.executeScript(
                    {code: "var v = document.getElementsByTagName('video')[0]; if (v!=null){v.pause()}"}
                );
            }
            chrome.tabs.sendMessage(tab.id, message, function (response) {
                console.log(response);
                
            });
        })
    });
}


// send timestamp to ppalli website
function sendTimestamp(tab) {
    if (tab.url === "https://tpi-ppalli.github.io/web-app/") {
        let tmp = "0:0:0";
        if (breakTimer.isRunning()) {
            let ms = breakTimer.getTimestamp();
            let hour = Math.floor(ms/3600000);
            let minute = Math.floor((ms - (hour * 3600000)) / 60000);
            let second = Math.floor((ms - (hour * 3600000) - (minute * 60000)) / 1000);
            tmp = hour + ':' + minute + ':' + second;
        }
        chrome.tabs.sendMessage(tab.id, {message: "change_timeStamp", time: tmp},
            function (response) {
                console.log(response);
            });
        //alert("sending " + tmp);
    }
}


// listen for messages from content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if  (request == "vid_stopped" || request == "no_vid"){
            stoppedWatching = true;
            if (!timerStarted) {
                // if no timer started and there's no vid playing then nothing happens
                sendResponse("No timer started");
            } else if (watchTimer.isRunning()) {
                // pause the watch timer, and start pause timer when video stops
                watchTimer.pause();
                pauseTimer.start();
                sendResponse("watchTimer stopped");
            } else if (breakTimer.isRunning()){
                stoppedWatching = true;
                // if video is stopped by the popup, we keep the breakTimer running even if the vid is stopped
                sendResponse("breakTimer resumed");
            }
            if (tabs[0].url === "https://tpi-ppalli.github.io/web-app/") {
                sendTimestamp(tabs[0]);
            }
        }

         else if (request === "start_timer") { // called when a new youtube page is opened
            stoppedWatching = false;
            if (!(breakTimer.isRunning() || watchTimer.isRunning())) { // only start timer once
                watchTimer.start();
                timerStarted = true;
                //alert("timer started");
            } else if (!timerStarted) { // pause timer done or break completed
                //alert("timer restarted");
                strikeCount = 1;
                watchTimer.start();
                timerStarted = true;
            } else if (breakTimer.isRunning()) { // make sure popup is showing
                stoppedWatching = true;
                if (strikeOut) {
                    messageContent("open_strikeout");
                } else {
                    messageContent("open_popup" + strikeCount);
                }
            } else {
                console.log("timer resumed");
                pauseTimer.stop();
                watchTimer.resume();
            }
            // listeners must send responses to make sure port is not closed before response received
            sendResponse("timer started in background.js");
        }
        else if (request === "strike_accepted") {
            redirect();
            sendResponse("redirected to: " + theURL);

        } else if (request === "strike_ignored") {
            // dialog closed by content.js
            // close dialogs on all youtube tabs
            messageContent("close_popup" + strikeCount);
            breakTimer.stop(); // stop the break timer
            watchTimer.stop(); // just in case
             

            if (strikeCount === 3) {
                stoppedWatching = true;
                messageContent("open_strikeout"); // open the strikeout popup
                strikeOut = true;
                breakTimer.start();
                strikeCount = 0; // reset strikeCount
            } else if (!stoppedWatching) {
                    watchTimer.start();
            }
            strikeCount++;
            sendResponse("strike changed to " + strikeCount);
        }
    });


// detect when the active tab changes
chrome.tabs.onActivated.addListener(
    function(activeInfo) {
        // check url of active tab
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            if (tabs[0].url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?.*/gm)) {

                stoppedWatching = false; // enable watch timer to start after break is complete

                if (pauseTimer.isRunning() && (!stoppedWatching)) { // pause timer running
                    //alert("pause timer running");
                    pauseTimer.stop();
                    watchTimer.resume();

                } else if (!timerStarted) { // pause timer done or break completed
                    //alert("timer restarted");
                    strikeCount = 1;
                    watchTimer.start();
                    timerStarted = true;
                }
                // if break is incomplete do nothing, use normal procedure
                // otherwise user is switching between 2 youtube tabs, also do nothing

            } else {
                //alert("switched to not youtube");
                if (breakTimer.isRunning()) {
                    //alert("break timer running");
                    // let break timer finish as usual
                    stoppedWatching = true;
                    if (strikeOut) { // make sure popup is open
                        messageContent("open_strikeout");
                    } else {
                        messageContent("open_popup" + strikeCount);
                    }
                    stoppedWatching = true; // prevent watch timer from starting after break complete

                } else if (watchTimer.isRunning()) {
                    //alert("watch timer running");
                    // pause the watch timer, and start pause timer
                    watchTimer.pause();
                    pauseTimer.start();
                    // if we switched back to youtube while pause timer still on
                    // then we stop pause timer, and resume watch timer

                } else { // this should only happen if youtube exited and timers all stop
                    //alert("no timer running");
                }
            }
            // send timestamp to ppalli website

            if (tabs[0].url === "https://tpi-ppalli.github.io/web-app/") {
                //alert("send on tab switched");
                sendTimestamp(tabs[0]);
            }

        })
    }
)

// detect when a tab's url changes, do the same thing as when the active tab switched
