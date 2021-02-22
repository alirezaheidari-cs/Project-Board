const SqliteDatabase = require('../DataAccess/SqliteDatabase');
const User = require('./User.js');
const Project = require('./Project.js');

class DatabaseHandler {
    async runDataBase() {
        await SqliteDatabase.runDatabase('../DataAccess/DB/');
        Project.connectToDatabase(SqliteDatabase);
        User.connectToDatabase(SqliteDatabase);
    }
}

module.exports = DatabaseHandler;