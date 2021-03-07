const SqliteDatabase = require('../DataAccess/SqliteDatabase');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');

class DatabaseHandler {
     runDataBase() {
        Project.connectToDatabase(SqliteDatabase);
        User.connectToDatabase(SqliteDatabase);
    }
}

module.exports = DatabaseHandler;