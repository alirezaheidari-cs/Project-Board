const got = require('got');
const SqliteDatabase = require('../DataAccess/SqliteDatabase');
const User = require('./User.js');
const Project = require('./Project.js');

class ServerDatabasePreprocessor {

    constructor(port) {
        this.port = port;
    }

    async getSkillsFromServer() {
        try {
            const response = await got('http://localhost:' + this.port + '/skill', {json: true});
            return response.body;

        } catch (error) {
            return undefined;
        }
    }

    async getProjectsFromServer() {
        try {
            const response = await got('http://localhost:' + this.port + '/project', {json: true});
            return response.body;

        } catch (error) {
            return undefined;
        }
    }

    async runDataBase() {
        await SqliteDatabase.runDatabase('../DataAccess/DB/');
        Project.setDatabase(SqliteDatabase);
        User.setDatabase(SqliteDatabase);
    }
}

module.exports = ServerDatabasePreprocessor;
