var express = require("express"),
    five = require("johnny-five"),
    Firebase = require("firebase"),
    converter = require("./utils/converter"),
    stringUtils = require("./utils/stringUtils"),
    moment = require("moment"),
  	app = express(),
	  port = process.env.PORT || 9900,
    firebaseName = 'automatr-test';

var automatrFirebase = new Firebase('https://{0}.firebaseio.com/'.format(firebaseName));
var environmentLog = new Firebase('https://{0}.firebaseio.com/environmentLog'.format(firebaseName));

var board = new five.Board();

board.on("ready", function() {

  board.repl.inject({

  }); 

});

app.listen(port);
console.log("Server started on port " + port);