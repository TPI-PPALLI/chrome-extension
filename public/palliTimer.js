/*global chrome*/

//alert("palli timer script started");
// receive messages from background

// timer
let hour = 0;
let minute = 0;
let second = 0;

let countdownTimer;


function formatTime(time) {
    if (time < 10) return "0" + time;
    return time;
}


// change numbers on website timer
function updateCountdown() {
    let display;
    display = formatTime(hour) + ':' + formatTime(minute) + ':' + formatTime(second);
    document.getElementById("Timer-num").innerText = display;
}


function startCountdown() {
    window.clearInterval(countdownTimer); // just in case
    countdownTimer = setInterval(function () {
        if (hour <= 0 && minute <= 0 && second <= 0) {
            clearInterval(countdownTimer);
        }
        else if (second === 0) {
            if (minute === 0) {
                if (hour === 0) { // just in case
                    clearInterval(countdownTimer);
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


// receive timestamp from background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "change_timeStamp") {
        clearInterval(countdownTimer); // stop the timer
        //alert("this: " + document.getElementById("Timer-num").innerText);
        let timestamp = request.time.split(":");
        hour = timestamp[0];
        minute = timestamp[1];
        second = timestamp[2];
        //alert("hour: " + hour + " min: " + minute + " sec: " + second);
        updateCountdown();
        startCountdown();

    }
    sendResponse("timestamp changed");
})


