var express = require("express"),
    five = require("johnny-five"),
  	app = express(),
	  port = process.env.PORT || 9900;
    
app.listen(port);
console.log("Server started on port " + port);