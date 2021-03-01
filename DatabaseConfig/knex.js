var environment = process.env.NODE_ENV || 'development'
var config = require('/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/knexfile')[environment]

module.exports = require('knex')(config)