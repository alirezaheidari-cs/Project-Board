const axios = require('axios').default;


class AuthenticationDataAccess {

    constructor(port) {
        this.port = port;
    }


    async sendRegisterInformationToServer(id, password) {
        try {
            const response = await axios.post('http://localhost:9000/register', {
                id: id,
                password: password
            });
            return response.data;

        } catch (e) {
            console.log(e)
        }
    }

    async sendLoginInformationToServer(id,password) {
        try {
            const response = await axios.post('http://localhost:9000/login', {
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
            const response = await axios.post('http://localhost:9000/getUserIdWithToken', {
                token: token
            });
            return response.data.id;

        } catch (e) {
            console.log(e)
        }
    }

    async isTokenExpired(token){
        try {
            const response = await axios.post('http://localhost:9000/isTokenExpired', {
                token: token
            });
            if(response.data.isExpired === "True")
                return true
            return false;

        } catch (e) {
            console.log(e)
        }
    }
}

// (async () => {
//     let a = new AuthenticationDataAccess(9000);
//     // let bb= await a.sendRegisterInformationToServer("ali" , "heidar")
//     let b = await a.isTokenExpired( "heidari")
//     console.log(b)
// })()

module.exports = AuthenticationDataAccess




