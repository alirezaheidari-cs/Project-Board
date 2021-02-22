const got = require('got');

class ServerDataAccess {

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

}

module.exports = ServerDataAccess;
