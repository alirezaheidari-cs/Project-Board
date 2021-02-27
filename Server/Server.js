const express = require('express');
const app = express();


class Server {
    static availableSkills = [{skillName: "HTML"}, {skillName: "CSS"}, {skillName: "JAVA"}, {skillName: "CPP"}, {skillName: "C"}, {skillName: "JS"}];
    // static allProjects = [{
    //     id: 11,
    //     title: "project1",
    //     skills: [{skillName: "HTML", points: 10}, {skillName: "CSS", points: 20}],
    //     budget: 10,
    //     ownerId: "user1",
    //     bidOffers: [],
    //     description: "goood",
    //     deadline: 1633811400000,
    //     winnerId: undefined,
    //     imageURL: "asfaa",
    //     isActive: true
    // }, {
    //     id: 12,
    //     title: "project1",
    //     skills: [{skillName: "HTML", points: 130}, {skillName: "CSS", points: 230}],
    //     budget: 10,
    //     ownerId: "user2",
    //     bidOffers: [],
    //     description: "goood",
    //     deadline: 1633811400000,
    //     winnerId: undefined,
    //     imageURL: "asfaa",
    //     isActive: true
    // }, {
    //     id: 13,
    //     title: "project1",
    //     skills: [{skillName: "HTML", points: 10}, {skillName: "CSS", points: 20}],
    //     budget: 10,
    //     ownerId: "user3",
    //     bidOffers: [],
    //     description: "goood",
    //     deadline: 1633811400000,
    //     winnerId: undefined,
    //     imageURL: "asfaa",
    //     isActive: true
    // }
    // ];
    static allProjects = [];

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