var express = require("express"),
    five = require("johnny-five"),
    Firebase = require("firebase"),
    _ = require("underscore"),
    converter = require("utils/converter"),
    request = require("request"),
    moment = require("moment"),
    stringUtils = require("utils/stringUtils"),

	app = express(),
	port = process.env.PORT || 9900,
  monitoringInterval,
  firebaseName = 'automatr-test';

var stopMonitor = new Firebase('https://{0}.firebaseio.com/monitoredStop'.format(firebaseName));

var board = new five.Board({port: "/dev/ttyAMA0"});

board.on("ready", function() {  

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [7, 8, 9, 10, 11, 12],
    // Options:
    // bitMode: 4 or 8, defaults to 4
    // lines: number of lines, defaults to 2
    // dots: matrix dimensions, defaults to "5x8"
  });

  stopMonitor.on('value', function (snapshot) {
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

	});

  board.repl.inject({
    led: led
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

app.listen(port);
console.log("Server started on port " + port);