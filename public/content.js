// this content script is called when the user opens youtube in their browser

// this is to use chrome functions like chrome.runtime.sendMessage
/*global chrome*/


// for timer
let hour = 0;
let minute = 0;
let second = 0;
let youtubeTimer;
let timerMessage = "Next break in: ";

function formatTime(time) {
    if (time < 10) return "0" + time;
    return time;
}

function pauseCountdown() { // since hour minute and second store time values, just stop timer
    clearInterval(youtubeTimer);
}

// change numbers on website timer
function updateCountdown() {
    //alert("update countdown");
    let display;
    display = formatTime(hour) + ':' + formatTime(minute) + ':' + formatTime(second);
    $("#timerDialog_ID").dialog({
        title: timerMessage + display
    });
}


function startCountdown() {
    //alert("countdown started");
    clearInterval(youtubeTimer); // just in case
    youtubeTimer = setInterval(function () {
        if (hour <= 0 && minute <= 0 && second <= 0) {
            clearInterval(youtubeTimer);
        }
        else if (second === 0) {
            if (minute === 0) {
                if (hour === 0) { // just in case
                    clearInterval(youtubeTimer);
                } else {
                    hour--;
                    minute = 59;
                    second = 59;
                }
            } else {
                minute--;
                second = 59;
            }
        } else {
            second--;
        }
        updateCountdown();
    }, 1000);
}


var oldURL = "";
var currentURL = window.location.href;
function checkURLchange(currentURL){
    if (currentURL != oldURL){
        var v = document.getElementsByTagName("video")[0];
        if (v != null){
            console.log("video exists");
            v.addEventListener("play", function() { 
                console.log('video playing...');
                chrome.runtime.sendMessage("start_timer", function(response) {
                    console.log(response);
                });
            }, true);
            v.addEventListener("pause", function() { 
                console.log('video stopped...');
                chrome.runtime.sendMessage("vid_stopped", function(response) {
                    console.log(response);
                });
            }, true);
        } else {
            console.log("aw no video??!");
            chrome.runtime.sendMessage("no_vid");
        };

        oldURL = currentURL;
    }

    oldURL = window.location.href;
    setInterval(function() {
        checkURLchange(window.location.href);
    }, 500);
}


checkURLchange();


console.log("chrome extension working...");


// show popups


// show youtube timer
var timerDialog = document.createElement("div");
timerDialog.id = "timerDialog_ID";
document.body.append(timerDialog);


// add strike 1 popup to dom
var popup1 = document.createElement("div");
popup1.id = "strike1_popup_ID";
let image1 = chrome.extension.getURL("src/ppalli_exercise.png");
popup1.innerHTML = '<h1>First strike!</h1> <img style="width:70px;height:auto;" id="someImage" />';
document.body.append(popup1);
document.getElementById('someImage').src = image1;


// add strike 2 popup to dom
var popup2 = document.createElement("div");
popup2.id = "strike2_popup_ID";
let image2 = chrome.extension.getURL("src/ppalli_meditation.png");
popup2.innerHTML = '<h1>Second strike!</h1> <img style="width:70px;height:auto;" id="someImage2" />';
document.body.append(popup2);
document.getElementById('someImage2').src = image2;


// add strike 3 popup to dom
var popup3 = document.createElement("div");
popup3.id = "strike3_popup_ID";
let image3 = chrome.extension.getURL("src/ppalli_2_strike.png");
popup3.innerHTML = '<h1>Third strike!</h1> <img style="width:70px;height:auto;" id="someImage3" />';
document.body.append(popup3);
document.getElementById('someImage3').src = image3;


// add strike 3 popup to dom
var strike3popup = document.createElement("div");
strike3popup.id = "strike_3_ID";
document.body.append(strike3popup);


// timer functionality
var time = "0:00:00";
$(function() {
    $( "#timerDialog_ID" ).dialog({
        dialogClass: "no-close timer-dialog", // no-close to remove x button
        title: "Next break in: " + time,
        position: { my: "right bottom", at: "right-230 top+50"},
        height: 50,
        width: 280,
        draggable: true,
        autoOpen: true, // opens dialog when youtube is reloaded, set this to false later for timer
        modal: false, // disables other functions on the page
    });
});


// add functionality to popup (jquery dialog)
$(function() {
    $( "#strike1_popup_ID" ).dialog({
        dialogClass: "no-close", // no-close to remove x button
        title: "STRIKE ",
        resizable: false,
        draggable: false,
        height: 300,
        width: 450,
        autoOpen: false, // opens dialog when youtube is reloaded, set this to false later for timer
        modal: true, // disables other functions on the page
        buttons: {
            Accept: function() { // send message to background.js to redirect
                chrome.runtime.sendMessage("strike_accepted", function(response) {
                    console.log(response);
                });
            },
            Ignore: function() { // send message to background.js to increase strikeCount
                chrome.runtime.sendMessage("strike_ignored", function(response) {
                    console.log(response);
                });
                $(this).dialog("close");
            }
        },
    });
});


$(function() {
    $( "#strike2_popup_ID" ).dialog({
        dialogClass: "no-close", // no-close to remove x button
        title: "STRIKE ",
        resizable: false,
        draggable: false,
        height: 300,
        width: 450,
        autoOpen: false, // opens dialog when youtube is reloaded, set this to false later for timer
        modal: true, // disables other functions on the page
        buttons: {
            Accept: function() { // send message to background.js to redirect
                chrome.runtime.sendMessage("strike_accepted", function(response) {
                    console.log(response);
                });
            },
            Ignore: function() { // send message to background.js to increase strikeCount
                chrome.runtime.sendMessage("strike_ignored", function(response) {
                    console.log(response);
                });
                $(this).dialog("close");
            }
        },
    });
});


$(function() {
    $( "#strike3_popup_ID" ).dialog({
        dialogClass: "no-close", // no-close to remove x button
        title: "STRIKE ",
        resizable: false,
        draggable: false,
        height: 300,
        width: 450,
        autoOpen: false, // opens dialog when youtube is reloaded, set this to false later for timer
        modal: true, // disables other functions on the page
        buttons: {
            Accept: function() { // send message to background.js to redirect
                chrome.runtime.sendMessage("strike_accepted", function(response) {
                    console.log(response);
                });
            },
            Ignore: function() { // send message to background.js to increase strikeCount
                chrome.runtime.sendMessage("strike_ignored", function(response) {
                    console.log(response);
                });
                $(this).dialog("close");
            }
        },
    });
});


// strike 3 functionality, remove ignore option
$(function() {
    $( "#strike_3_ID" ).dialog({
        dialogClass: "no-close",
        title: "STRIKE OUT!",
        resizable: false,
        height: 300,
        draggable: false,
        width: 450,
        autoOpen: false,
        modal: true,
        buttons: {
            Accept: function() { // send message to background.js to redirect
                chrome.runtime.sendMessage("strike_accepted", function(response) {
                    console.log(response);
                });
            },
        },
    });
});


// send message to start timer, runs when page reloaded
//chrome.runtime.sendMessage("start_timer", function(response) {
    //console.log(response);
//});

// receive messages from background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.message == "open_strikeout") {
            $("#strike_3_ID").dialog("open"); // opens strike 3 dialog
            // listeners need to send responses to make sure the port is not closed before response received
            sendResponse("strike 3 received, opening strike 3 popup ");
        } else if (request.message == "open_popup1") {
            $("#strike1_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "close_popup1") {
            $("#strike1_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "open_popup2") {
             $("#strike2_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "close_popup2") {
            $("#strike2_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "open_popup3") {
            $("#strike3_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "close_popup3") {
            $("#strike3_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "close_strikeout") {
            $("#strike_3_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request.message == "pause_timer") {
            pauseCountdown();
            sendResponse("pausing timer");
        } else if (request.message == "stop_timer") {
            pauseCountdown();
            hour = 0;
            minute = 0;
            second = 0;
            sendResponse("stopping timer");
        } else if (request.message == "change_timeStamp") {
            let timestamp = request.time.split(":");
            hour = timestamp[0];
            minute = timestamp[1];
            second = timestamp[2];
            if (request.timerType === "watchTimer") {
                timerMessage = "Next break at: ";
            } else if (request.timerType === "breakTimer") {
                timerMessage = "Break over at: ";
            } else {
                timerMessage = "Pause timer: ";
            }
            updateCountdown();
            //startCountdown(); // countdown slows down youtube too much :/ using timestamps for now
            sendResponse("updating timestamp");
        }
    });

// window.addEventListener("message", function(event) {
//     if (event.source !== window) return;
//     onDidReceiveMessage(event);
// });

// async function onDidReceiveMessage(event) {
//     if (event.data.type && (event.data.type === "GET_EXTENSION_ID")) {
//         document.postMessage({ type: "EXTENSION_ID_RESULT", extensionId: chrome.runtime.id }, "*");
//     }
// }