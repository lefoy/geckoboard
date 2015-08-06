var twitch = require("./modules/twitch.js");

console.log("Starting dashboard application...");
var timer = setInterval(function() {
    twitch.update();
}, 10000);
