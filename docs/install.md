Installation instructions for node.js on Raspberry Pi
=====================================================

For Raspberry Pi with Arduino shield bridge:

- https://github.com/watterott/RPi-ShieldBridge/blob/master/docu/Arduino.md

Install Firmata for control with python or node.js

- https://github.com/watterott/RPi-ShieldBridge/blob/master/docu/Firmata.md

Install SSH
`sudo apt-get install ssh`, have it start at bootup, `sudo update-rc.d ssh defaults`

or

`sudo raspi-config -> enable SSH`


Node on Pi install caveats
--------------------------
Latest npm?
`npm install npm -g --ca=""`

workaround
`npm config set ca=""`
`sudo /opt/node/bin/npm install -g`

Forever to keep node server running
-----------------------------------
`npm install -g forever`

`forever start -l forever.log -o out.log -e err.log server.js`

