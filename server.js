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
  var thermSensor = five.Sensor({pin: "I0", freq: moment.duration(30, 'seconds').asMilliseconds()});
  var photoSensor = five.Sensor({pin: "I2", freq: moment.duration(30, 'seconds').asMilliseconds()});
  var proximity = new five.Sensor({pin: "I5"}); //freq: moment.duration(500, 'milliseconds').asMilliseconds()}

  thermSensor.on("data", function() {
     var tempCelsius = converter.celsius(this.value).toFixed(1)
     automatrFirebase.update({temperature: {value:tempCelsius, timestamp: Date.now()}});    
     environmentLog.push({temperature: {value: tempCelsius, timestamp: Date.now()}});
     //lcd.cursor(0, 0).print("Temp: " + converter.celsius(this.value).toFixed(1) + String.fromCharCode(223) + "C");
  });

  photoSensor.on("data", function () {
    automatrFirebase.update({brightness: {value: this.value, timestamp: Date.now()}});
    environmentLog.push({brightness: {value: this.value, timestamp: Date.now()}});
  });

  proximity.on("change", function() {
   //console.log(this.value);
   this.value > 0 ? automatrFirebase.update({proximity: {value: true, timestamp: Date.now()}}) : automatrFirebase.update({proximity: {value: false, timestamp: Date.now()}});
  });

  automatrFirebase.on('value', function (snapshot) {
        snapshot.val().lightswitch ? led.on() : led.off();      
    });

  board.repl.inject({
    led: led,
    thermSensor: thermSensor,
    proximity: proximity
  }); 

});

app.listen(port);
console.log("Server started on port " + port);