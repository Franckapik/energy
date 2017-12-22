var SerialPort = require('serialport');
var Influx = require('influx');
var config = require('./config');

//Configuration de la base de donnes
var db = new Influx.InfluxDB({
  host: config.host,
  database: config.database,
  tags: config.tags
});

const Readline = SerialPort.parsers.Readline;

var port = new SerialPort('/dev/ttyAMA0', {
  baudRate: 9600,
  dataBits: 7,
  stopBits: 1,
  parity: 'even',
  flowControl :true

},

function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }

});

const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

port.on('open', showPortOpen);
parser.on('data', readSerialData);
port.on('close', showPortClose);
port.on('error', showError);


function showPortOpen() {
   console.log('Ouverture Port :' + port.baudRate);
}

function readSerialData(data) {
if (data.match("IINST")) {

  var puissance = parseInt(data.replace( /^\D+/g, '')) * 230 ;

  db.writePoints([{
    "measurement": "dht",

    "fields": {
      "Puissance (W)": puissance

    }
  }]);

     console.log(data);
 }

 else if (data.match("HCHC")) {
    console.log(data);
 }
 else if (data.match("HCHP")) {
    console.log(data);
 }

}

function showPortClose() {
   console.log('port closed.');
}

function showError(error) {
   console.log('Serial port error: ' + error);
}
