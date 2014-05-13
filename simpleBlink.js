var express = require("express"),
    five = require("johnny-five")
	   app = express(),
	   port = process.env.PORT || 9900;

var board = new five.Board();

board.on("ready", function() {
  
});

app.listen(port);
console.log("Server started on port " + port);