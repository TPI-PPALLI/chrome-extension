
/*global chrome*/
// timer is done here so we could potentially manage multiple tabs
let strikeURL = "https://tpi-ppalli.github.io/web-app/"; // where to redirect when strike is accepted
let strikeCount = 1;

// in milliseconds
let breakInterval = 10000;
let watchInterval = 5000;
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
}


// set timers to call each other recursively
let watchTimer = new Timer(function () {
    watchTimer.setRunning(false);
    messageContent("open_popup" + strikeCount); // send message to content.js to open popup
    breakTimer.start();
}, watchInterval);

<<<<<<< HEAD
=======

let breakTimer = new Timer(function () {
    breakTimer.setRunning(false);
    messageContent("close_strikeout");
    messageContent("close_popup" + strikeCount); // send message to content.js to close popup
    strikeCount = 1; // reset strike count upon successful break completion
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
    strikeCount = 1;
}, pauseInterval)


// END OF GLOBAL VARIABLES


>>>>>>> 2b6efe788647816385620b9fb712931735c019e3
// cannot call from content.js so need to call here
function redirect() {
    chrome.tabs.create({url: strikeURL});
}

<<<<<<< HEAD
=======

// helper to message content.js
function messageContent(message) {
    chrome.tabs.query({url: "*://*.youtube.com/*"}, function (tabs) { // send message to all tabs with youtube url
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, message, function (response) {
                console.log(response);
            });
        })
    });
}


>>>>>>> 2b6efe788647816385620b9fb712931735c019e3
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
<<<<<<< HEAD
            setTimeout(function () { // remove popup after break
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, "close_popup", function (response) {
                        console.log(response);
                    });
                });
            }, breakInterval);
            strikeCount = 0; // reset strikeCount
            sendResponse("redirected to " + strikeURL);

        } else if (request == "strike_ignored") {
=======
            sendResponse("redirected to: " + theURL);

        } else if (request === "strike_ignored") {
>>>>>>> 2b6efe788647816385620b9fb712931735c019e3
            // dialog closed by content.js
            breakTimer.stop(); // stop the break timer
            watchTimer.stop(); // just in case

            if (strikeCount === 3) {
                messageContent("open_strikeout"); // open the strikeout popup
                breakTimer.start();
                strikeCount = 0; // reset strikeCount
            } else {
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

                if (pauseTimer.isRunning()) { // pause timer running
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
        })
    }
)