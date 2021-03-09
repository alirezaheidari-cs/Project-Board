var environment = process.env.NODE_ENV || 'development';
var config = require('/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/knexfile')['development'];

module.exports = require('knex')(config);

