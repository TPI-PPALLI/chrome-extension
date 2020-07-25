
/*global chrome*/

// timer is done here so we could potentially manage multiple tabs

let theURL = "https://tpi-ppalli.github.io/web-app/"; // where to redirect when strike is accepted
let strikeCount = 1;
// in milliseconds
let breakInterval = 10000;
let watchInterval = 3000;



// cannot call from content.js so need to call here
function redirect() {
    chrome.tabs.create({url: theURL});
}



// listen for messages from content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request == "start_timer") { // called when a new youtube page is opened
            setTimeout(function () { // tell content.js to show popup after watchInterval
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, "open_popup", function (response) {
                        console.log(response);
                    });
                });
            }, watchInterval);
            // listeners must send responses to make sure port is not closed before response received
            sendResponse("timer started in background.js");
        }
        else if (request == "strike_accepted") {
            redirect();
            setTimeout(function () { // remove popup after break
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, "close_popup", function (response) {
                        console.log(response);
                    });
                });
            }, breakInterval);
            strikeCount = 0; // reset strikeCount
            sendResponse("redirected to " + theURL);

        } else if (request == "strike_ignored") {
            // dialog closed by content.js
            strikeCount++;
            if (strikeCount == 3) { // open the strike 3 popup
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, "strike_3", function (response) {
                        console.log(response);
                    });
                });
                // remove popup after watchInterval
                setTimeout(function () { // remove popup after break
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, "close_3_popup", function (response) {
                            console.log(response);
                        });
                    });
                }, breakInterval);

                strikeCount = 0; // reset strikeCount

                setTimeout(function () { // open strike popup after watchInterval
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, "open_popup", function (response) {
                            console.log(response);
                        });
                    });
                }, watchInterval);

            } else { //
                setTimeout(function () { // open strike popup after watchInterval
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, "open_popup", function (response) {
                            console.log(response);
                        });
                    });
                }, watchInterval);
            }
            sendResponse("strike changed to " + strikeCount);
        }
    });
