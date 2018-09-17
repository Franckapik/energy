const SerialPort = require('serialport');
const Influx = require('influx');
const config = require('./config');
const CronJob = require('cron').CronJob;

const job = new CronJob('* 0 * * * *', function() {
  consoHeure();
});
console.log('Cron activé');
job.start();


//Configuration de la base de donnes
var linkyDB = new Influx.InfluxDB(config.linkySchema);

const Readline = SerialPort.parsers.Readline;


var port = new SerialPort('/dev/ttyAMA0', {
    baudRate: 9600,
    dataBits: 7,
    stopBits: 1,
    parity: 'even',
    flowControl: true
  },

  function(err) {
    if (err) {
      return console.log('Error: ', err.message);
    }

  });

const parser = port.pipe(new Readline({
  delimiter: '\r\n'
}));

port.on('open', function() {
  console.log('Ouverture Port :' + port.baudRate);
});

parser.on('data', readSerialData);
port.on('close', function() {
  console.log('port closed.');
});
port.on('error', function(error) {
  console.log('Serial port error: ' + error);
});

var puissance;
var hchc;
var hchp;
var previous_hchc;
var previous_hchp;

function readSerialData(data) {
  if (data) {
    if (data.match("PAPP")) {

      puissance = parseInt(data.replace(/^\D+/g, ''));

      console.log(data);
    } else if (data.match("HCHC")) {
      hchc = parseInt(data.replace(/^\D+/g, ''));
      console.log(data);
    } else if (data.match("HCHP")) {
      hchp = parseInt(data.replace(/^\D+/g, ''));
      console.log(data);

    }
  } else {
    console.log('Absence de données du compteur Linky');
  }


}

function consoHeure() {
  linkyDB.query(`
     select * from linky
     order by time desc
     limit 1
   `).then(previous => {
    if (previous[0]) {
      previous_hchc = parseInt(previous[0].hchc);
      previous_hchp = parseInt(previous[0].hchp);

      var dif_hchc = hchc - previous_hchc;
      if (dif_hchc > 0) {
        return dif_hchc
      } else {
        return hchp - previous_hchp
      }
    } else {
      return 0
    }
  }).then(consoH => {
    console.log(consoH);
    if (consoH) {
      linkyDB.writePoints([{
        "measurement": "linky",

        "fields": {
          "puissance_w": puissance,
          "hchc": hchc,
          "hchp": hchp,
          "consoHeure": consoH
        }
      }]);
      console.log('Insertion BD')
    } else {
      console.log('Aucune donnée à insérer');
    }


  }).catch(err => {
    console.log(err);
  });
}
