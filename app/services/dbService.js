const config = require('../config/database')

const db = require('knex')({
  client: 'mysql',
  connection: config
})

module.exports = db