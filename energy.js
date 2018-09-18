const SerialPort = require('serialport');
const Influx = require('influx');
const config = require('./config');
const linkyDB = new Influx.InfluxDB(config.linkySchema);
const Readline = SerialPort.parsers.Readline;
const debugRead = require('debug')('read');
const debugWrite = require('debug')('write');


var port = new SerialPort('/dev/ttyAMA0', config.port,
  function(err) {
    if (err) {
      return err.message;
    }
  });

const parser = port.pipe(new Readline({
  delimiter: '\r\n'
}));

port.on('open', function() {
  debugRead('Ouverture Port :' + port.baudRate);
});
parser.on('data', promise1);
port.on('error', function(error) {
  debugRead('Serial port error: ' + error);
});

var puissance;
var hchc;
var hchp;
var previous_hchc;
var previous_hchp

promise1()
.then((puissance, hchc, hchp) => {
  console.log(puissance, hchc, hchp);
})
.catch((err)=>console.log(err));

function promise1() {
  return new Promise(function(resolve, reject) {
    if (data) {
      if (data.match("PAPP")) {
        var puissance = parseInt(data.replace(/^\D+/g, ''));
        debugRead(data);
      } else if (data.match("HCHC")) {
        var hchc = parseInt(data.replace(/^\D+/g, ''));
        debugRead(data);
      } else if (data.match("HCHP")) {
        var hchp = parseInt(data.replace(/^\D+/g, ''));
        debugRead(data);
      }
    } else if (puissance, hchc, hchp) {
      resolve(puissance, hchc, hchp)
    } else {
      reject('Absence de données du compteur Linky');
    }
  })
}

function readSerialData(data) {
  if (data) {
    if (data.match("PAPP")) {
      puissance = parseInt(data.replace(/^\D+/g, ''));
      debugRead(data);
    } else if (data.match("HCHC")) {
      hchc = parseInt(data.replace(/^\D+/g, ''));
      debugRead(data);
    } else if (data.match("HCHP")) {
      hchp = parseInt(data.replace(/^\D+/g, ''));
      debugRead(data);
    }
  } else {
    debugRead('Absence de données du compteur Linky');
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
    debugWrite(consoH);
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
      debugWrite('Insertion BD')
    } else {
      debugWrite('Aucune donnée à insérer');
    }

  }).catch(err => {
    debugWrite(err);
  });
}
