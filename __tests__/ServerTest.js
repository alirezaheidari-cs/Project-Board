const Server = require('../Server/Server.js');
const ServerConnection = require('../Model/ServerDatabasePreprocesoor.js');
let server, ServerDatabasePreprocessor;

server = new Server(3000);
ServerDatabasePreprocessor = new ServerConnection(3000);

describe("test ./Server/Server.js and ./User/ServerDatabasePreprocessor.js", () => {

    test("get skills from server on port 3000", async () => {
        let skillsSet = await ServerDatabasePreprocessor.getSkillsFromServer();
        expect(skillsSet).toEqual([{name: "HTTP"}, {name: "CSS"}, {name: "JAVA"}, {name: "CPP"}, {name: "C"}, {name: "JS"}]);
    });

    test("get projects from server on port 3000", async () => {
        let projects = await ServerDatabasePreprocessor.getProjectsFromServer();
        expect(projects.length).toBe(3);
    });

});


