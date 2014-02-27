var express = require("express"),
    five = require("johnny-five"),
    Firebase = require("firebase"),
    _ = require("underscore"),
    converter = require("./converter"),
    request = require("request"),
    moment = require("moment"),

	app = express(),
	port = process.env.PORT || 9900,
    Thermistor,
    monitoringInterval;

var automatrFirebase = new Firebase('https://automatr.firebaseio.com/');
var tempratureLog = new Firebase('https://automatr.firebaseio.com/environmentLog');
var stopMonitor = new Firebase('https://automatr.firebaseio.com/monitoredStop');


/*setInterval(function() {
    tempratureLog.push({brightness: {value: _.random(0, 1023), timestamp: Date.now()}});

}, 5000);

tempratureLog.on('child_added', function(snapshot) {
  var msgData = snapshot.val();
  console.log(msgData.brightness.value + ' timestamp ' + msgData.brightness.timestamp);
});*/
var board = new five.Board({port: "/dev/ttyAMA0"});

board.on("ready", function() {
  
  var led = new five.Led("O5");
  var thermSensor = five.Sensor({pin: "I0", freq: moment.duration(30, 'seconds').asMilliseconds()});
  var photoSensor = five.Sensor({pin: "I2", freq: moment.duration(30, 'seconds').asMilliseconds()});

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
     var tempCelsius = converter.celsius(this.value).toFixed(1)
     automatrFirebase.update({temprature: {value:tempCelsius, timestamp:Date.now()}});     
     tempratureLog.push({temprature: {value: tempCelsius, timestamp: Date.now()}});
     //lcd.cursor(0, 0).print("Temp: " + converter.celsius(this.value).toFixed(1) + String.fromCharCode(223) + "C");
  });

  photoSensor.on("data", function () {
    automatrFirebase.update({brightness: {value: this.value, timestamp: Date.now()}});
    tempratureLog.push({brightness: {value: this.value, timestamp: Date.now()}});
  })

  automatrFirebase.on('value', function (snapshot) {
        snapshot.val().lightswitch ? led.on() : led.off();        
    });

  /*stopMonitor.on('value', function (snapshot) {
	monitoringInterval && clearInterval(monitoringInterval);
	var travelInfo = snapshot.val().stop;
	var $lcd = lcd;
	if(travelInfo.cancelMonitoring) {
		monitoringInterval && clearInterval(monitoringInterval);
		console.log("Monitoring stopped");
		lcd.cursor(1, 0);
		lcd.print('');
	}
	else {
			monitoringInterval = setInterval(function () {
			getTravelInfo(travelInfo, $lcd);
		}, moment.duration(30, 'seconds').asMilliseconds(), travelInfo);
	}

	});*/

  board.repl.inject({
    led: led,
    thermSensor: thermSensor
  }); 

});

function getTravelInfo(travelInfo, lcd) {
		request('http://reis.trafikanten.no/ReisRest/RealTime/GetRealTimeData/' + travelInfo.stopRef + '', function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		var json = JSON.parse(body);  		
    		var destination = _.find(json, function(item) {
    			return (item.PublishedLineName == travelInfo.name &&
    				   item.DirectionName == travelInfo.direction &&
    				   item.DestinationRef == travelInfo.destinationRef);
    		});
    		if(destination) 
    		{
    			var output = destination.LineRef + " " + destination.DestinationDisplay.substring(0,6) + ". " + calculateExpectedTimeString(destination.ExpectedArrivalTime);
    			lcd.cursor(1, 0);
    			lcd.print(output);
    		}
  		}
	});
}

function calculateExpectedTimeString(actualTime) {
	var diffFromNow = moment(actualTime).diff(moment(), 'minutes');

	if(diffFromNow === 0) {
	    return 'Nå'
	}

	return diffFromNow > 10 ? moment(actualTime).format('HH:mm') : diffFromNow + ' min';
}

app.get('/message', function(req, res) {	
	res.json({message:'ok'});
});

app.listen(port);
console.log("Server started on port " + port);