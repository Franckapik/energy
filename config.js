var config = {

host: '192.168.1.78',
database: 'domotique',
tags: 'energy',
linkySchema: {
  host: config.host,
  database: config.database,
  schema: [{
    measurement: 'linky',
    fields: {
      puissance_w: Influx.FieldType.INTEGER,
      hchc: Influx.FieldType.INTEGER,
      hchp: Influx.FieldType.INTEGER,
      consoHeure: Influx.FieldType.INTEGER
    },
    tags: [
      config.tags
    ]
  }]
}


}

module.exports = config;
