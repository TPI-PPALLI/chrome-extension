
/*global chrome*/

// timer is done here so we could potentially manage multiple tabs
let strikeURL = "https://tpi-ppalli.github.io/web-app/"; // where to redirect when strike is accepted
let strikeCount = 1;
let strikeOut = false;

// in milliseconds
let breakInterval = 600000; // 30min is 1800000
let watchInterval = 600000;
let pauseInterval = breakInterval;

let stoppedWatching = false;
let timerStarted = false;
let prevIgnored = false;

// define timer class
let Timer = function(callback, time, enablecountdown) {
    let countdownON = enablecountdown;
    let timerID;
    let remaining = time;
    let start;
    let running = false; // track if timer is running

    this.stop = function() {
        if (running) {
            window.clearTimeout(timerID);
            running = false;
            remaining = time;
            timerStarted = false;
        }
    }
    this.start = function() {
        window.clearTimeout(timerID);
        start = Date.now();
        timerID = window.setTimeout(callback, time);
        running = true;
        remaining = time;
        timerStarted = true;
        if (countdownON) sendYoutubeTimestamp();
    }
    this.pause = function() {
        if (running) {
            timerStarted = false;
            window.clearTimeout(timerID);
            remaining -= Date.now() - start;
            running = false;
        }
    };
    this.resume = function(sendTime) {
        timerStarted = true;
        start = Date.now();
        window.clearTimeout(timerID);
        timerID = window.setTimeout(callback, remaining);
        //alert(remaining);
        running = true;
        if (countdownON && (sendTime === undefined)) sendYoutubeTimestamp();
    };
    this.isRunning = function() {
        return running;
    }
    this.setRunning = function(state) {
        running = state;
    }
    this.getTimestamp = function() {
        let resumeAllowed = running;
        this.pause();
        if (resumeAllowed) { this.resume(false); } // dont start timer if not running
        let date = new Date(Date.now() + remaining); // change to remaining for ms
        //alert("date: " + date);
        return date;
        //return remaining;
    }
    this.updateTimeInterval = function (newTime) {
        time = newTime;
    }
}

let runTimer = false;

function closeAllPopups() {
    // close all popups just in case
    messageYoutube("close_strikeout");
    for (var i = 1; i <= 3; i++) {
        messageYoutube("close_popup" + strikeCount)
    }
}


// set timers to call each other recursively

let watchTimer = new Timer(function () {
    closeAllPopups();
    watchTimer.setRunning(false);
    messageYoutube("open_popup" + strikeCount); // send message to content.js to open popup
    breakTimer.start();
    }, watchInterval, true);


let breakTimer = new Timer(function () {
    breakTimer.setRunning(false);
    closeAllPopups();
    strikeCount = 1; // reset strike count upon successful break completion
    if (!stoppedWatching) {
        watchTimer.start();
    } else {
        timerStarted = false;
        //pauseTimer.start();
    }
}, breakInterval, true);


// if watch timer is running but you pause the video or go to a new page that is not youtube
let pauseTimer = new Timer(function () {
    // close all popups just in case
    closeAllPopups();
    pauseTimer.setRunning(false);
    watchTimer.stop();
    breakTimer.stop();
    timerStarted = false;
    stoppedWatching = true;
    strikeCount = 1;
}, pauseInterval, true);



// END OF GLOBAL VARIABLES //////////////////////////////////////////////////////////////////////////////////////////


// cannot call from content.js so need to call here
function redirect() {
    chrome.tabs.create({url: strikeURL});
}

function isPlaying() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "get_isPlaying"}, function (response) {
            if (response) {
                watchTimer.start();
            } else {
                pauseTimer.start();
            }
            timerStarted = true;
        });
    });
}


// helper to message content.js
function messageYoutube(toMessage) {
    chrome.tabs.query({url: "*://*.youtube.com/*"}, function (tabs) { // send message to all tabs with youtube url
        tabs.forEach(function(tab) {
            if (toMessage == "open_popup" + strikeCount || toMessage == "open_strikeout") {
                chrome.tabs.executeScript(
                    {code: "var v = document.getElementsByTagName('video')[0]; if (v!=null){v.pause()}"}
                );
            }
            chrome.tabs.sendMessage(tab.id, {message: toMessage}, function (response) {
                console.log(response);
            });
        })
    });
}


function sendYoutubeTimestamp() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        sendTimestamp(tabs[0]);
    });
}


// send timestamp to ppalli website
function sendTimestamp(tab) {
        let timestamp = "0:0:0";
        var ms = new Date(Date.now());
        var type = "none";
        if (breakTimer.isRunning()) {
            ms = breakTimer.getTimestamp();
            type = "breakTimer";
        } else if (watchTimer.isRunning()) {
            ms = watchTimer.getTimestamp();
            type = "watchTimer";
        } else if (pauseTimer.isRunning()) {
            ms = pauseTimer.getTimestamp();
            type = "pauseTimer";
        }
        timestamp = ms.getTime(); // timestamp in ms, marks when the timer will end
        //alert("ms: " + ms.getTime());

        chrome.tabs.sendMessage(tab.id, {message: "change_timeStamp", time: timestamp, timerType: type },
            function (response) {
                console.log(response);
            });
}



// listen for messages from content.js ////////////////////////////////////////////////////////////////////////////
// listen for messages from content.js and frontend
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (typeof request !== 'object') {
            if (request === "vid_stopped" || request === "no_vid") {
                stoppedWatching = true;
                if (!timerStarted) {
                    // if no timer started and there's no vid playing then nothing happens
                    sendResponse("No timer started");

                } else if (watchTimer.isRunning()) {
                    // pause the watch timer, and start pause timer when video stops
                    watchTimer.pause();
                    pauseTimer.start();
                    sendResponse("watchTimer stopped");

                } else if (breakTimer.isRunning()) {
                    stoppedWatching = true;
                    // if video is stopped by the popup, we keep the breakTimer running even if the vid is stopped
                    sendResponse("breakTimer resumed");

                } else {
                    sendResponse("ERROR: request: " + request + " is not dealt with");
                }

            } else if (request === "vid_played") { // called when a video is played
                stoppedWatching = false;

                if (watchTimer.isRunning()) {
                    // do nothing
                    sendResponse("watchTimer still running");

                } else if (!timerStarted) { // pause timer done | break done | youtube opened first time
                    //alert("timer restarted");
                    strikeCount = 1; // reset strike count if no recent popup ignored
                    //else prevIgnored = false; // for future
                    watchTimer.start();
                    timerStarted = true;
                    sendResponse("timer started in background.js");

                } else if (breakTimer.isRunning()) {
                    // make sure popup is showing
                    // popup is up so watch timer does not start
                    stoppedWatching = true;
                    if (strikeOut) {
                        messageYoutube("open_strikeout");
                    } else {
                        messageYoutube("open_popup" + strikeCount);
                    }
                    sendResponse("video played, break time not complete");

                } else if (pauseTimer.isRunning()) {
                    pauseTimer.stop();
                    watchTimer.resume();
                    //sendYoutubeTimestamp();
                    sendResponse("watchTimer resumed");

                } else {
                    // listeners must send responses to make sure port is not closed before response received
                    sendResponse("ERROR: vid play should not reach here");
                }

            } else if (request === "strike_accepted") {
                redirect();
                sendResponse("redirected to: " + strikeURL);

            } else if (request === "strike_ignored") {
                // dialog closed by content.js
                // close dialogs on all youtube tabs
                messageYoutube("close_popup" + strikeCount);
                breakTimer.stop(); // stop break timer
                watchTimer.stop(); // just in case
                sendYoutubeTimestamp();

                if (strikeCount === 3) {
                    stoppedWatching = true;
                    messageYoutube("open_strikeout"); // open the strikeout popup
                    strikeOut = true;
                    breakTimer.start();
                    strikeCount = 0; // reset strikeCount

                } else {
                    messageYoutube("URL_update"); // make sure play/pause listeners are on just in case
                    // start pauseTimer if paused, watchTimer if playing
                    isPlaying();
                }
                strikeCount++;
                sendResponse("strike changed to " + strikeCount);

            } else {
                sendResponse("ERROR: unknown request");
            }

        } else if (typeof request === 'object' && request !== null) {
            var currentTimer = getRunning();
            if (request.message === "break") {
                //alert("break changed");
                breakTimer.stop();
                watchTimer.stop();
                pauseTimer.stop();
                strikeOut = false;
                strikeCount = 0;
                breakInterval = request.time * 60000;
                pauseInterval = breakInterval;
                breakTimer.updateTimeInterval(breakInterval); // recreate timer with new interval
                pauseTimer.updateTimeInterval(pauseInterval);
                stoppedWatching = true;
                if (currentTimer != "none") currentTimer.start();
                sendResponse("break interval: " + breakInterval + " request.time: " + request.time);
            } else if (request.message === "watch") {
                //alert("watch changed");
                breakTimer.stop();
                watchTimer.stop();
                pauseTimer.stop();
                strikeOut = false;
                strikeCount = 0;
                watchInterval = request.time * 60000;
                watchTimer.updateTimeInterval(watchInterval); // recreate timer with new interval
                stoppedWatching = false;
                if (currentTimer != "none") currentTimer.start();
                sendResponse("watch interval: " + watchInterval + " request.time " + request.time);
            }
        }
    });


// return the currently running timer
function getRunning() {
    if (breakTimer.isRunning()) {
        return breakTimer;
    } else if (watchTimer.isRunning()) {
        return watchTimer;
    } else if (pauseTimer.isRunning()) {
        return pauseTimer;
    } else {
        return "none";
    }
}


// for url and tab changes ////////////////////////////////////////////////////////////////////////////////////////

// detect when active tab changes
chrome.tabs.onActivated.addListener(
    function(activeInfo) {
        // check url of active tab
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            if (tabs[0].url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?.*/gm)) {
                messageYoutube("URL_update");
                sendYoutubeTimestamp();
                stoppedWatching = false;
                // let timers run as they were before
                // need to find a way to deal with continuous play/pause ex. u come back and the video is still playing
                // since video is STILL playing, there is no new pause/play event heard by listener.
                // Need to create an isPlaying() method

                if (pauseTimer.isRunning() && (!stoppedWatching)) { // pause timer running
                    //alert("pause timer running");
                    //pauseTimer.stop();
                    //messageYoutube("URL_update");
                    //sendYoutubeTimestamp();
                    //sendTimestamp(tabs[0]);

                } else if (!timerStarted) { // pause timer done or break completed
                    //alert("timer restarted");
                    if (!prevIgnored) strikeCount = 1;
                    else prevIgnored = false;
                    //messageYoutube("URL_update");
                    //sendTimestamp(tabs[0]);
                    //timerStarted = true;
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
                        messageYoutube("open_strikeout");
                    } else {
                        messageYoutube("open_popup" + strikeCount);
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
chrome.webNavigation.onCompleted.addListener(function (tabId, changeInfo, tab) {
    // get tab url
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        onUrlChange(tabs[0]);
    });
});


// for url changes due to clicking back button, note this may be called several times per change
chrome.webNavigation.onHistoryStateUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        onUrlChange(tabs[0]);
    });
});


function onUrlChange(tab) {
    if (tab.url === "https://tpi-ppalli.github.io/web-app/") {
        //alert("send on updated");
        sendTimestamp(tab);

    } else if (tab.url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?.*/gm)) {
        if (tab.url === "https://www.youtube.com/") {
            // treat home page like a paused video
            //alert("home page");
            if (watchTimer.isRunning()) {
                watchTimer.pause();
                pauseTimer.start();
            }
        }
        if (breakTimer.isRunning()) { // make sure popup is open
            if (strikeOut) {
                messageYoutube("open_strikeout");
            } else {
                messageYoutube("open_popup" + strikeCount);
            }
            stoppedWatching = true;
        }
        sendYoutubeTimestamp();
        messageYoutube("URL_update");

    } else {
        if (watchTimer.isRunning()) {
            watchTimer.pause();
            pauseTimer.start();
        }
    }
}