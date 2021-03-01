const SqliteDatabase = require('../DataAccess/SqliteDatabase');
const User = require('./User.js');
const Project = require('./Project.js');

class DatabaseHandler {
     runDataBase() {
        Project.connectToDatabase(SqliteDatabase);
        User.connectToDatabase(SqliteDatabase);
    }
}

module.exports = DatabaseHandler;