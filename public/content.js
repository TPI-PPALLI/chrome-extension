// this content script is called when the user opens youtube in their browser

// this is to use chrome functions like chrome.runtime.sendMessage
/*global chrome*/


console.log("chrome extension working...");
let global = -1;


// show popup

// add strike 1 and 2 popup to dom
var popup = document.createElement("div");
popup.id = "strike_popup_ID";
document.body.append(popup);


// add strike 3 popup to dom
var strike3popup = document.createElement("div");
strike3popup.id = "strike_3_ID";
document.body.append(strike3popup);


// add functionality to strike 1 and 2 popup (jquery dialog)
$(function() {
    $( "#strike_popup_ID" ).dialog({
        dialogClass: "no-close", // no-close to remove x button
        title: "STRIKE ",
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
chrome.runtime.sendMessage("start_timer", function(response) {
    console.log(response);
});


// receive messages from background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request == "open_popup_3") {
            $("#strike_3_ID").dialog("open"); // opens strike 3 dialog
            // listeners need to send responses to make sure the port is not closed before response received
            sendResponse("strike 3 received, opening strike 3 popup ");
        } else if (request == "open_popup") {
            $("#strike_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "close_popup") {
            $("#strike_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "close_popup_3") {
            $("#strike_3_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        }
    });







