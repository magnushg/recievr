var express = require("express"),
    five = require("johnny-five"),
    Firebase = require("firebase"),
    _ = require("underscore"),
    converter = require("./converter"),

	app = express(),
	port = process.env.PORT || 9900,
    Thermistor;

var automatrFirebase = new Firebase('https://automatr.firebaseio.com/');
var tempratureLog = new Firebase('https://automatr.firebaseio.com/environmentLog');

/*setInterval(function() {
    automatrFirebase.update({temprature: {value: _.random(15.0, 22.0), timestamp: Date.now()}});
    tempratureLog.push({temprature: {value: _.random(15.0, 22.0), timestamp: Date.now()}});

}, 1000);

tempratureLog.on('child_added', function(snapshot) {
  var msgData = snapshot.val();
  console.log(msgData.temprature.value + ' timestamp ' + msgData.temprature.timestamp);
});*/
var board = new five.Board();

board.on("ready", function() {
  
  var led = new five.Led("O5");
  var thermSensor = five.Sensor({pin: "I0", freq: (60 * 1000 * 10)});
  var photoSensor = five.Sensor({pin: "I2", freq: (60 * 1000 * 10)});

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [7, 8, 9, 10, 11, 12],
    // Options:
    // bitMode: 4 or 8, defaults to 4
    // lines: number of lines, defaults to 2
    // dots: matrix dimensions, defaults to "5x8"
  });

  thermSensor.on("data", function() {
     automatrFirebase.update({temprature: {value:converter.celsius(this.value).toFixed(1), timestamp:Date.now()}});     
     lcd.clear().cursor(0, 0).print("Temp: " + converter.celsius(this.value).toFixed(1) + String.fromCharCode(223) + "C");
     lcd.cursor(1, 0);
  });

  photoSensor.on("data", function () {
    automatrFirebase.update({brightness: {value: this.value, timestamp: Date.now()}});
  })

  automatrFirebase.on('value', function(snapshot) {
        var switchValue = snapshot.val().lightswitch;
        if(switchValue) {
            led.on();
        }
        else {
            led.off();
        }
    });

  board.repl.inject({
    led: led,
    thermSensor: thermSensor
  }); 

});

app.get('/message', function(req, res) {	
	res.json({message:'ok'});
});

app.listen(port);
console.log("Server started on port " + port);