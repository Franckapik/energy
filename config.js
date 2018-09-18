const Influx = require('influx');

var config = {
linkySchema: {
  host: '192.168.1.78',
  database: 'domotique',
  schema: [{
    measurement: 'linky',
    fields: {
      puissance_w: Influx.FieldType.INTEGER,
      hchc: Influx.FieldType.INTEGER,
      hchp: Influx.FieldType.INTEGER,
      consoHeure: Influx.FieldType.INTEGER
    },
    tags: [
      'energy'
    ]
  }]
},
port : {
    baudRate: 9600,
    dataBits: 7,
    stopBits: 1,
    parity: 'even',
    flowControl: true
  }


}

module.exports = config;
