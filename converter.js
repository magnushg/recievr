module.exports = function()
{
  var adcres, beta, kelvin, rb, ginf;

  adcres = 1023;
  // Beta parameter
  beta = 3950;
  // 0°C = 273.15 K
  kelvin = 273.15;
  // 10 kOhm
  rb = 10000;
  // Ginf = 1/Rinf
  ginf = 120.6685;

function celsius(raw) {
  var rthermistor, tempc;

  rthermistor = rb * (adcres / raw - 1);
  tempc = beta / (Math.log(rthermistor * ginf));

  return tempc - kelvin;
};

function fahrenheit(raw) {
  return (this.c(raw) * 9) / 5 + 32;
};

return {
  celsius : celsius,
  fahrenheit: fahrenheit
}


}();

