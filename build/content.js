// this content script is called when the user opens youtube in their browser

// this is to use chrome functions like chrome.runtime.sendMessage
/*global chrome*/


console.log("chrome extension working...");
var currentPopupOn = "popup";


// show popups

// add strike 1 popup to dom
var popup1 = document.createElement("div");
popup1.id = "strike1_popup_ID";
popup1.innerHTML = '<h1>First strike!</h1> <img href="src/ppalli_meditation" />';
document.body.append(popup1);

// add strike 2 popup to dom
var popup2 = document.createElement("div");
popup2.id = "strike2_popup_ID";
popup2.innerHTML = "<h1>Second strike!</h1>";
document.body.append(popup2);

// add strike 3 popup to dom
var popup3 = document.createElement("div");
popup3.id = "strike3_popup_ID";
popup3.innerHTML = "<h1>Third strike!</h1><img >";
document.body.append(popup3);


// add strike 3 popup to dom
var strike3popup = document.createElement("div");
strike3popup.id = "strike_3_ID";
document.body.append(strike3popup);


// add functionality to strike 1 and 2 popup (jquery dialog)
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
<<<<<<< HEAD
=======
        resizable: false,
        draggable: false,
        height: 300,
        width: 450,
>>>>>>> 2b6efe788647816385620b9fb712931735c019e3
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
chrome.runtime.sendMessage("start_timer", function(response) {
    console.log(response);
});



// receive messages from background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request == "open_strikeout") {
            $("#strike_3_ID").dialog("open"); // opens strike 3 dialog
            // listeners need to send responses to make sure the port is not closed before response received
            sendResponse("strike 3 received, opening strike 3 popup ");
        } else if (request == "open_popup1") {
            $("#strike1_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "close_popup1") {
            $("#strike1_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "open_popup2") {
            $("#strike2_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "close_popup2") {
            $("#strike2_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "open_popup3") {
            $("#strike3_popup_ID").dialog("open");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "close_popup3") {
            $("#strike3_popup_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else if (request == "close_strikeout") {
            $("#strike_3_ID").dialog("close");
            sendResponse("strike received, opening strike popup ");
        } else {
            //alert(request);
        }
    });