const axios = require('axios').default;


class AuthenticationDataAccess {

    constructor(port) {
        this.port = port;
    }

    async sendRegisterInformationToServer(id, password) {
        try {
            const response = await axios.post('http://localhost:' + this.port + '/register', {
                id: id,
                password: password
            });
            return response.data;

        } catch (e) {
            console.log(e)
        }
    }

    async sendLoginInformationToServer(id, password) {
        try {
            const response = await axios.post('http://localhost:' + this.port + '/login', {
                id: id,
                password: password
            });
            return response.data;

        } catch (e) {
            console.log(e)
        }
    }

    async getUserIdWithToken(token) {
        try {
            const response = await axios.post('http://localhost:' + this.port + '/getUserIdWithToken', {
                token: token
            });
            return response.data.id;

        } catch (e) {
            console.log(e)
        }
    }

    async isTokenExpired(token) {
        try {
            const response = await axios.post('http://localhost:' + this.port + '/isTokenExpired', {
                token: token
            });
            if (response.data.isExpired === "True")
                return true
            return false;

        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = AuthenticationDataAccess




