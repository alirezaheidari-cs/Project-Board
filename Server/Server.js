const express = require('express');
const app = express();


class Server {
    static availableSkills = [{skillName: "HTML"}, {skillName: "CSS"}, {skillName: "JAVA"}, {skillName: "CPP"}, {skillName: "C"}, {skillName: "JS"}];


    constructor(port) {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}!`)
        });

        app.get('/skill', (req, res) => {
            res.json(Server.availableSkills);
        });
    }
}

let server = new Server(8080);

module.exports = Server;