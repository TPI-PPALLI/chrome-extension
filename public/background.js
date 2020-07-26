
/*global chrome*/
// timer is done here so we could potentially manage multiple tabs

let theURL = "https://tpi-ppalli.github.io/web-app/"; // where to redirect when strike is accepted
let strikeCount = 0;

// in milliseconds
let breakInterval = 10000;
let watchInterval = 15000;
let pauseInterval = 5000;

let popupToOpen = "popup1";
let popupToClose = "popup1";
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
    }
    this.start = function() {
        window.clearTimeout(timerID);
        start = Date.now();
        timerID = window.setTimeout(callback, time);
        running = true;
    }
    this.pause = function() {
        window.clearTimeout(timerID);
        remaining -= Date.now() - start;
        running = false;
    };
    this.resume = function() {
        start = Date.now();
        window.clearTimeout(timerID);
        timerID = window.setTimeout(callback, remaining);
        running = true;
    };
    this.isRunning = function() {
        return running;
    }
    this.setRunning = function(state) {
        running = state;
    }
}


// set timers to call each other recursively
let watchTimer = new Timer(function () {
    watchTimer.setRunning(false);
    messageContent("open_" + popupToOpen); // send message to content.js to open popup
    breakTimer.start();
}, watchInterval);

let breakTimer = new Timer(function () {
    breakTimer.setRunning(false);
    messageContent("close_" + popupToClose); // send message to content.js to close popup
    if (!stoppedWatching) watchTimer.start();
    else timerStarted = false;
}, breakInterval);

// if watch timer is running but you switch tabs out of youtube, reset timers after pauseInterval
let pauseTimer = new Timer(function () {
    pauseTimer.setRunning(false);
    watchTimer.stop();
    breakTimer.stop();
    timerStarted = false;
    stoppedWatching = true;
}, pauseInterval)


// END OF GLOBAL VARIABLES


// cannot call from content.js so need to call here
function redirect() {
    chrome.tabs.create({url: theURL});
}


// helper to message content.js
function messageContent(message) {
    if (message.match("open*")) {
        popupToClose = popupToOpen;
    }
    chrome.tabs.query({url: "*://*.youtube.com/*"}, function (tabs) { // send message to all tabs with youtube url
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, message, function (response) {
                console.log(response);
            });
        })
    });
}


// listen for messages from content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request === "start_timer") { // called when a new youtube page is opened
            if (!(timerStarted || breakTimer.isRunning() || watchTimer.isRunning())) { // only start timer once
                watchTimer.start();
                timerStarted = true;
                //alert("timer started");
            }
            // listeners must send responses to make sure port is not closed before response received
            sendResponse("timer started in background.js");
        }
        else if (request === "strike_accepted") {
            redirect();
            strikeCount = 0;
            sendResponse("redirected to: " + theURL);

        } else if (request === "strike_ignored") {
            // dialog closed by content.js
            breakTimer.stop(); // stop the break timer
            watchTimer.stop(); // just in case
            strikeCount++;

            if (strikeCount == 1) {
                popupToOpen = "popup2"; // if strikecount is 1, we prepare to open the second-strike window 
            } 
            if (strikeCount == 2) {
                popupToOpen = "popup3"; // if strikecount is 2, we prepare to open the third-strike window 
            } 
            if (strikeCount == 3) {
                popupToOpen = "popup_3";
                messageContent("open_" + popupToOpen); // open the strike 3 popup, will set popupToClose = popup_3
                popupToOpen = "popup1"; // for next popup after popup_3 closed
                breakTimer.start();
                strikeCount = 0; // reset strikeCount

            } else { //
                watchTimer.start();
            }
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

                if (pauseTimer.isRunning()) { // pause timer running
                    //alert("pause timer running");
                    pauseTimer.stop();
                    watchTimer.resume();

                } else if (!timerStarted) { // pause timer done or break completed
                    //alert("timer restarted");
                    strikeCount = 0;
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
                    stoppedWatching = true; // prevent watch timer from starting after break complete

                } else if (watchTimer.isRunning()) {
                    //alert("watch timer running");
                    // pause the watch timer, and start pause timer
                    watchTimer.pause();
                    pauseTimer.start();
                    // if we switched back to youtube while pause timer still on
                    // then we stop pause timer, and resume watch timer

                } else {
                    //alert("no timer running");
                }
            }
        })
    }
)
