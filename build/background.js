
/*global chrome*/

// timer is done here so we could potentially manage multiple tabs

let theURL = "https://tpi-ppalli.github.io/web-app/"; // where to redirect when strike is accepted
let strikeCount = 0;

// in milliseconds
let breakInterval = 10000;
let watchInterval = 3000;

var popupToOpen = "popup";
var popupToClose = "popup";


// define timer class
var Timer = function(callback, time) {
    var timerID;
    this.stop = function() {
        window.clearTimeout(timerID);
    }
    this.start = function() {
        window.clearTimeout(timerID);
        timerID = window.setTimeout(callback, time);
    }
}


// set timers
var watchTimer = new Timer(function () {
    messageContent("open_" + popupToOpen); // send message to content.js to open popup
    breakTimer.start();
}, watchInterval);

var breakTimer = new Timer(function () {
    messageContent("close_" + popupToClose); // send message to content.js to close popup
    watchTimer.start();
}, breakInterval);


// END OF GLOBAL VARIABLES


// cannot call from content.js so need to call here
function redirect() {
    chrome.tabs.create({url: theURL});
}


// helper to message content.js
function  messageContent(message) {
    if (message.match("open*")) {
        popupToClose = popupToOpen;
    }
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            console.log(response);
        });
    });
}


// listen for messages from content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request == "start_timer") { // called when a new youtube page is opened
            watchTimer.start();

            // listeners must send responses to make sure port is not closed before response received
            sendResponse("timer started in background.js");
        }
        else if (request == "strike_accepted") {
            redirect();

        } else if (request == "strike_ignored") {
            // dialog closed by content.js
            breakTimer.stop(); // stop the break timer
            watchTimer.stop(); // just in case
            strikeCount++;

            if (strikeCount == 3) {
                popupToOpen = "popup_3";
                messageContent("open_" + popupToOpen); // open the strike 3 popup, will set popupToClose = popup_3
                popupToOpen = "popup"; // for next popup after popup_3 closed
                breakTimer.start();
                strikeCount = 0; // reset strikeCount

            } else { //
                watchTimer.start();
            }
            sendResponse("strike changed to " + strikeCount);
        }
    });
