/*global chrome*/

//alert("palli timer script started");
// receive messages from background

// timer
let hour = 0;
let minute = 0;
let second = 0;
let endTime;
let countdownTimer;
let message = "Time for a break!"


function formatTime(time) {
    if (time < 10) return "0" + time;
    return time;
}


// change numbers on website timer
function updateCountdown() {
    let display;
    if (hour < 0) {
        hour = 0; minute = 0; second = 0;
    }
    display = formatTime(hour) + ':' + formatTime(minute) + ':' + formatTime(second);
    document.getElementById("Timer-num").innerText = display;
    document.getElementById("Timer-message").innerText = message;
}


function startCountdown() {
    window.clearInterval(countdownTimer); // just in case
    countdownTimer = setInterval(function () {
        if (hour <= 0 && minute <= 0 && second <= 0) {
            clearInterval(countdownTimer);
        }
        if (hour < 0 || minute < 0 || second < 0) {
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
        if (request.timerType === "breakTimer") message = "Time for a break!";
        else if (request.timerType === "pauseTimer") message = "Pause Timer:";
        else if (request.timerType === "watchTimer") message = "Watch Timer:";
        clearInterval(countdownTimer); // stop the timer
        //alert("this: " + document.getElementById("Timer-num").innerText);
        /*
        let timestamp = request.time.split(":");
        let date = new Date(Date.now());
        hour = timestamp[0] - date.getHours();
        minute = timestamp[1] - date.getMinutes();
        second = timestamp[2] - date.getSeconds();
         */
        let ms = request.time;
        endTime = ms;
        let diff = ms - Date.now();
        hour = Math.floor(diff/3600000);
        minute = Math.floor((diff - (hour * 3600000)) / 60000);
        second = Math.floor((diff - (hour * 3600000) - (minute * 60000)) / 1000);
        //alert("hour: " + hour + " min: " + minute + " sec: " + second);
        updateCountdown();
        startCountdown();

    }
    sendResponse("timestamp changed");
})


