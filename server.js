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
  var thermSensor = five.Sensor({pin: "I0", freq: moment.duration(5, 'seconds').asMilliseconds()});
  var photoSensor = five.Sensor({pin: "I2", freq: moment.duration(5, 'seconds').asMilliseconds()});

  automatrFirebase.on('value', function (snapshot) {
      snapshot.val().lightswitch ? relay.on() : relay.off();
  });

  thermSensor.on('data', function () {
    var temperature = converter.celsius(this.value).toFixed(2);
    var tempLog = {temperature: {value:temperature, timestamp: Date.now()}};
    console.log("Temperature: " + temperature);
    automatrFirebase.update(tempLog);
    environmentLog.push(tempLog);
  });

  photoSensor.on('data', function () {
    var brightnessLog = {brightness: {value:this.value, timestamp: Date.now()}};
    console.log("Brightness: " + this.value);    
    automatrFirebase.update(brightnessLog);
    environmentLog.push(brightnessLog);
  });

  board.repl.inject({
    led: led,
    thermSensor: thermSensor,
    relay: relay
  });
});

app.listen(port);
console.log("Server started on port " + port);