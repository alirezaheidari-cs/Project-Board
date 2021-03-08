const PostgresDataAccess = require('./PostgresDataAccess');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');

class DatabaseHandler {
     runDataBase() {
        Project.connectToDatabase(PostgresDataAccess);
        User.connectToDatabase(PostgresDataAccess);
    }
}

module.exports = DatabaseHandler;