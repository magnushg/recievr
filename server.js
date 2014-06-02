var express = require("express"),
    five = require("johnny-five"),
  	app = express(),
	  port = process.env.PORT || 9900,
    converter = require("./utils/converter"),
    stringUtils = require("./utils/stringUtils"),
    Firebase = require("firebase"),
    firebaseName = 'automatr-test',
      
      
    automatrFirebase = new Firebase('https://{0}.firebaseio.com/'.format(firebaseName)),
    environmentLog = new Firebase('https://{0}.firebaseio.com/environmentLog'.format(firebaseName));
    
    var board = new five.Board();
    
    board.on("ready", function() {
     var led = five.Led("O0");
          
     var tempSensor = five.Sensor({pin: "I0", freq: 2000});
     
     tempSensor.on("data", function() {
       var tempCelsius = converter.tempC(this.value).toFixed(1);
       var temperature = {temperature: {value:tempCelsius, timestamp: Date.now()}};
       automatrFirebase.update(temperature);    
       environmentLog.push(temperature);
       });

     var coffeeMaker = new five.Relay("O3");
     
     automatrFirebase.on('value', function (snapshot) {
           snapshot.val().coffee ? coffeeMaker.on() : coffeeMaker.off();
       });
     
     var lightSensor = five.Sensor({pin: "I2", freq: 2000});
     var lightSwitch = new five.Relay("O5");
     
     lightSensor.on("data", function () {
         var brightness = {brightness: {value: this.value, timestamp: Date.now()}}
         automatrFirebase.update(brightness);
         environmentLog.push(brightness); 
         this.value < 200 ? lightSwitch.on() : lightSwitch.off();
         });
     
     var proximity = new five.Sensor({pin: "I5"});
      
     proximity.on("change", function() {
       if(this.value > 0) {
       automatrFirebase.update({proximity: {value: true, timestamp: Date.now()}});
       led.on();
       }
       else {
       automatrFirebase.update({proximity: {value: false, timestamp: Date.now()}});
       led.off();
       }
     });


     automatrFirebase.on('value', function (snapshot) {
       snapshot.val().lightswitch ? lightSwitch.on() : lightSwitch.off();   
     });
     
       
     board.repl.inject({
        
      });
     
    });
    
    
app.listen(port);
console.log("Server started on port " + port);