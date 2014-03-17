var express = require("express"),
    five = require("johnny-five"),
    Firebase = require("firebase"),
    converter = require("./utils/converter"),
    stringUtils = require("./utils/stringUtils"),
    moment = require("moment"),

	app = express(),
	port = process.env.PORT || 9900,
    Thermistor
    firebaseName = 'automatr-test';

var automatrFirebase = new Firebase('https://{0}.firebaseio.com/'.format(firebaseName));
var environmentLog = new Firebase('https://{0}.firebaseio.com/environmentLog'.format(firebaseName));

var board = new five.Board({port: "/dev/ttyAMA0"});

board.on("ready", function() {
  
  var led = new five.Led("O5");
  var relay = new five.Relay("O0");
  var thermSensor = five.Sensor({pin: "I0", freq: moment.duration(30, 'seconds').asMilliseconds()});
  var photoSensor = five.Sensor({pin: "I2", freq: moment.duration(30, 'seconds').asMilliseconds()});

  automatrFirebase.on('value', function (snapshot) {
      snapshot.val().lightswitch ? relay.on() : relay.off();
  });

  board.repl.inject({
    led: led,
    thermSensor: thermSensor,
    relay: relay
  });
});

app.listen(port);
console.log("Server started on port " + port);