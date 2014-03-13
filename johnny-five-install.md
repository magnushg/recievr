Install instructions for johnny-five on Windows
===============================================

1. Install python 2.* http://www.python.org/download/releases/2.7.6/
2. Add python to path
3. ´npm install node-gyp´
4. Make sure you have the preferred version of node.js, use nvmw to ensure right node version, https://github.com/hakobera/nvmw
5. ´npm install johnny-five´
6. In Arduino tools go to File->Examples->Firmata->StandardFirmata, upload this sketch to your arduino
7. Create a simple node app called blink.js

´var j5 = require("johnny-five");

	var board = new j5.Board({port: "COM7"}),
	led;

	var LEDPIN = 13;

	board.on("ready", function(){
  		console.log('Ready!!');
  		led = new j5.Led({pin: LEDPIN});
  		led.strobe();

  board.repl.inject({
  	led:led
  });
});´
8. Make sure johnny-five is using right COM port
9. ´node blink.js´
10. Awesome!



Serial port node package installation guide
-------------------------------------------
https://github.com/voodootikigod/node-serialport#toinstall

