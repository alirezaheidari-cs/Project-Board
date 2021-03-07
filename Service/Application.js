const ServerDataAccess = require('../Model/ServerDataAccess.js');
const DatabaseHandler = require('../Model/DatabaseHandler.js');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');
const AuthenticationDataAccess = require('../Model/AuthenticationDataAccess.js');
const cron = require("node-cron");
var stdin = process.openStdin();
const Skill = require('../Model/Skill');
const BidOffer = require('../Model/BidOffer');
const Endorsement = require('../Model/Endorsement');
const copyToClipboard = require('copy-to-clipboard');

/*
login {"id":"user1","password":"alireza"}
addProject {"id":3,"title":"project3","skills":[{"skillName":"HTML","points":20}],"budget":100,"ownerId":"user1","description":"goood","deadline":"2021/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ0NjM5MjIsImlkIjoidXNlcjUifQ.RY_fJwU4IeBAuF0Kp05_Wr2VIESqQuDdbc2kAyIJAu8"}
bid {"biddingUser":"user3","projectId":1,"bidAmount":10,"token":""}
auction {"id":"user1","projectId":1,"token":""}
editProfile {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQyNzMwMjcsImlkIjoidXNlcjIifQ.dU2hYhhDNHMhofKCHl8hTWSysTHygbHXLf4i05OIISo"}
removeSkill {"id":"user3","skillName":"CSS","token":""}
seeAllUsersInformation {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQyNzMwMjcsImlkIjoidXNlcjIifQ.dU2hYhhDNHMhofKCHl8hTWSysTHygbHXLf4i05OIISo"}
endorseAUserSkill {"id":"user3","endorsedUserId":"user1","skillName":"JS","token":""}
seeSpecificProjectInformation {"id":3,"token":""}
seeSpecificUserInformation {"id":"user44","token":""}
addSkill {"id":"user4","skillName":"CSS","points":120,"token":""}
showProfile {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQyNzMwMjcsImlkIjoidXNlcjIifQ.dU2hYhhDNHMhofKCHl8hTWSysTHygbHXLf4i05OIISo"}
register {"id":"user1","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}

**************************************************
register {"id":"user1","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user2","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user3","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user4","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user5","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}

addProject {"id":1,"title":"project1","skills":[{"skillName":"CSS","points":20}],"budget":10,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNTYwMTEsImlkIjoidXNlcjEifQ.Oia7hGhSkfTwShp9JQAeNHuyj96m3RSXAREVxz88t8U"}
addProject {"id":2,"title":"project2","skills":[{"skillName":"HTML","points":20},{"skillName":"CSS","points":20}],"budget":1,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3Mjk1NDAsImlkIjoidXNlcjEifQ.rJsgv3a-XvV_i4GopeKnLIsyAuNxPRRRmWEr9ndiXVI"}

addProject {"id":3,"title":"project2","skills":[{"skillName":"HTML","points":20},{"skillName":"CSS","points":20}],"budget":1,"description":"goood","deadline":"2010/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3Mjk1NDAsImlkIjoidXNlcjEifQ.rJsgv3a-XvV_i4GopeKnLIsyAuNxPRRRmWEr9ndiXVI"}
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ2NTkzMDEsImlkIjoidXNlcjEifQ.d1K5GDINPY2gdiSrx0qSW4z1CKCnRODsPFBVSQmvYk0

login {"id":"user1","password":"alireza"}
addProject {"id":3,"title":"project3","skills":[{"skillName":"HTML","points":20}],"budget":100,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3Mjk1NDAsImlkIjoidXNlcjEifQ.rJsgv3a-XvV_i4GopeKnLIsyAuNxPRRRmWEr9ndiXVI"}
bid {"projectId":3,"bidAmount":1,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3MDQ1NTcsImlkIjoidXNlcjMifQ.LbBiyY1yJ-D5Rr4GO1nwQ6-yWhEeHib2iJafnm8qz6Y"}
auction {"projectId":1,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNTYwMTEsImlkIjoidXNlcjEifQ.Oia7hGhSkfTwShp9JQAeNHuyj96m3RSXAREVxz88t8U"}
editProfile {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUxODYsImlkIjoidXNlcjEifQ.bGifla6IEEwzJ796Dcqw9qzLDng1REvvOfgDwuvtKVY"}
removeSkill {"skillName":"HTML","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUxODYsImlkIjoidXNlcjEifQ.bGifla6IEEwzJ796Dcqw9qzLDng1REvvOfgDwuvtKVY"}
seeAllUsersInformation {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ0MTMyMDksImlkIjoidXNlcjEifQ.n3Zfb3VmgfDzKi-w-zeSat1ITZAA4ykaDcH48jLk6VM"}
endorseAUserSkill {"endorsedUserId":"user1","skillName":"HTML","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUyNzAsImlkIjoidXNlcjIifQ.k1Xs5-qyoJLtGs7Cg-wDvXWX5pwn75fzLwOiCtDokrg"}
seeSpecificProjectInformation {"id":1,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUxMzY4ODcsImlkIjoidXNlcjEifQ.Zu_w9xyMPOe8f1CaOk5orXgVh7GjrBXoKB8cQ5u6b9s"}
seeSpecificUserInformation {"id":"user2" ,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUxMzY4ODcsImlkIjoidXNlcjEifQ.Zu_w9xyMPOe8f1CaOk5orXgVh7GjrBXoKB8cQ5u6b9s"}
addSkill {"skillName":"HTML","points":19,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUxODYsImlkIjoidXNlcjEifQ.bGifla6IEEwzJ796Dcqw9qzLDng1REvvOfgDwuvtKVY"}
showProfile {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUxODYsImlkIjoidXNlcjEifQ.bGifla6IEEwzJ796Dcqw9qzLDng1REvvOfgDwuvtKVY"}
register {"id":"user1","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","password":"alireza","bio":"olympiad","profilePictureURL":"gog"}

eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUxMzY4ODcsImlkIjoidXNlcjEifQ.Zu_w9xyMPOe8f1CaOk5orXgVh7GjrBXoKB8cQ5u6b9s
*/
class Application {
    static loginRegisterMenuCommands = ["register", "login", "end"];
    static userAreaMenuCommands = ["register", "logout", "editProfile", "seeAllAvailableProjectsInformation", "seeSpecificProjectInformation"
        , "seeAllUsersInformation", "seeSpecificUserInformation", "bid", "endorseAUserSkill", "addProject", "auction", "end"];
    static editProfileMenuCommands = ["register", "logout", "addSkill",
        "removeSkill", "back", "showProfile", "seeAvailableSkills", "end"];
    static skillsSet;
    static authenticationPort = 9999;
    static serverPort = 8080;

    constructor() {
        this.currentMenu = "loginRegisterMenu";
        this.authenticationDataAccess = undefined
    }

    setCurrentMenu(menu) {
        this.currentMenu = menu;
    }

    static async getSkillsAndProjectsFromServer() {
        const serverDataAccess = new ServerDataAccess(Application.serverPort);
        Application.skillsSet = await serverDataAccess.getSkillsFromServer();
    }

    static async runDatabase() {
        const dataBaseHandler = new DatabaseHandler();
        await dataBaseHandler.runDataBase();
    }

    async runApplication() {
        this.authenticationDataAccess = new AuthenticationDataAccess(Application.authenticationPort)
        await this.readCommandsFromConsole();
    }

    static async convertProjectJSONToProjectObject(allProjectsDataJSON) {
        if (allProjectsDataJSON !== undefined) {
            for (let i = 0; i < allProjectsDataJSON.length; i++) {
                let projectData = allProjectsDataJSON[i];
                let project = new Project(projectData.id, projectData.title, projectData.skills, projectData.budget, projectData.ownerId,
                    projectData.bidOffers, projectData.description, (new Date(projectData.deadline)).getTime(), projectData.winnerId, projectData.imageURL, projectData.isActive);
                await Project.addProject(project);
            }
        }
    }

    static async checkProjectsDeadlinesPassed() {
        let currentDate = new Date(), allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            if (project.deadline < currentDate.getTime() && project.getIsActive()) {
                await Application.getAuctionWinner(project.getId());
            }
        }
    }

    async readCommandsFromConsole() {
        let inputCommand = "";
        let application = this
        stdin.addListener("data", async function (input) {
            inputCommand = input.toString().trim();
            if (inputCommand === "end") {
                process.exit(1)
            }
            await application.handleCommandsWithMenu(inputCommand, application.currentMenu);
        });
    }

    static getJSONPartOfCommandWithGivenRegex(inputCommand, regex, message) {
        let matcher = regex.exec(inputCommand);
        let JSONPartOfCommand;
        try {
            JSONPartOfCommand = JSON.parse(matcher[1]);
        } catch (e) {
            return "wrong format for " + message;
        }
        return JSONPartOfCommand;
    }

    async handleCommandsWithMenu(inputCommand, currentMenu) {
        let message = "invalid command";
        let commandExists;
        if (currentMenu === "loginRegisterMenu") {
            commandExists = Application.loginRegisterMenuCommands.find((availableCommand) => {
                return inputCommand.startsWith(availableCommand) || inputCommand === availableCommand
            });
            if (commandExists !== undefined) {
                message = await this.loginRegisterMenuCommandsHandler(inputCommand);
            }
        } else if (currentMenu === "userAreaMenu") {
            commandExists = Application.userAreaMenuCommands.find((availableCommand) => {
                return inputCommand.startsWith(availableCommand) || inputCommand === availableCommand
            });
            if (commandExists !== undefined) {
                message = await this.userAreaMenuCommandsHandler(inputCommand);
            }
        } else if (currentMenu === "editProfileMenu") {
            commandExists = Application.editProfileMenuCommands.find((availableCommand) => {
                return inputCommand.startsWith(availableCommand) || inputCommand === availableCommand
            });
            if (commandExists !== undefined) {
                message = await this.editProfileMenuCommandsHandler(inputCommand);
            }
        }
        console.log(message);
        console.log(this.availableCommandsForThisMenu());
    }

    async loginRegisterMenuCommandsHandler(inputCommand) {
        if (inputCommand.startsWith("register ")) {
            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /register ({.+})/, "user Information");
            if (userInformationJSON === undefined)
                return userInformationJSON;
            return await this.registerUser(userInformationJSON);
        } else if (inputCommand.startsWith("login ")) {
            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /login ({.+})/, "user Information");
            if (userInformationJSON === undefined)
                return userInformationJSON;
            return await this.loginUser(userInformationJSON);
        } else {
            return "invalid command";
        }
    }

    async userAreaMenuCommandsHandler(inputCommand) {
        if (inputCommand.startsWith("register ")) {
            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /register ({.+})/, "user Information");
            if (userInformationJSON === undefined)
                return userInformationJSON;
            return await this.registerUser(userInformationJSON);

        } else if (inputCommand.startsWith("addProject ")) {
            let projectInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /addProject ({.+})/, "project Information");
            if (projectInformationJSON === undefined)
                return projectInformationJSON;
            if ((await this.authenticationDataAccess.isTokenExpired(projectInformationJSON.token)))
                return this.handleLogout();
            return await this.addProject(projectInformationJSON);

        } else if (inputCommand.startsWith("bid ")) {
            let bidInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /bid ({.+})/, "bid Information");
            if (bidInformationJSON === undefined)
                return bidInformationJSON;
            if ((await this.authenticationDataAccess.isTokenExpired(bidInformationJSON.token)))
                return this.handleLogout();

            return await this.submitBidForProject(bidInformationJSON);
        } else if (inputCommand.startsWith("auction ")) {
            let auctionInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /auction ({.+})/, "auction Information");
            if (auctionInformationJSON === undefined)
                return auctionInformationJSON;
            if ((await this.authenticationDataAccess.isTokenExpired(auctionInformationJSON.token)))
                return this.handleLogout();

            return await this.handleAuction(auctionInformationJSON);
        } else if (inputCommand.startsWith("seeAllUsersInformation")) {
            let seeAllUsersInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAllUsersInformation ({.+})/, "see all users information");
            if (seeAllUsersInformationJSON === undefined)
                return seeAllUsersInformationJSON;
            if ((await this.authenticationDataAccess.isTokenExpired(seeAllUsersInformationJSON.token)))
                return this.handleLogout();
            return await this.getAllUsersInformation();

        } else if (inputCommand.startsWith("logout")) {
            return this.handleLogout();
        } else if (inputCommand.startsWith("editProfile")) {

            let editProfileJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /editProfile ({.+})/, "edit profile");
            if (editProfileJSON === undefined)
                return editProfileJSON;
            if ((await this.authenticationDataAccess.isTokenExpired(editProfileJSON.token)))
                return this.handleLogout();
            this.setCurrentMenu("editProfileMenu");
            return "welcome to editProfileMenu";

        } else if (inputCommand.startsWith("seeAllAvailableProjectsInformation")) {

            let seeAllAvailableProjectsInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAllAvailableProjectsInformationJSON ({.+})/, "see all available projects");
            if (seeAllAvailableProjectsInformationJSON === undefined)
                return seeAllAvailableProjectsInformationJSON;
            if (await this.authenticationDataAccess.isTokenExpired(seeAllAvailableProjectsInformationJSON.token))
                return this.handleLogout();
            return await this.getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON);

        } else if (inputCommand.startsWith("seeSpecificProjectInformation")) {
            let seeSpecificProjectInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificProjectInformation ({.+})/, "see a specific project information");
            if (seeSpecificProjectInformationJSON === undefined)
                return seeSpecificProjectInformationJSON;
            if (await this.authenticationDataAccess.isTokenExpired(seeSpecificProjectInformationJSON.token))
                return this.handleLogout();

            return await this.getSpecificProjectInformation(seeSpecificProjectInformationJSON);
        } else if (inputCommand.startsWith("seeSpecificUserInformation")) {
            let seeSpecificUserInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificUserInformation ({.+})/, "see a specific user information");
            if (seeSpecificUserInformationJSON === undefined)
                return seeSpecificUserInformationJSON;
            if (await this.authenticationDataAccess.isTokenExpired(seeSpecificUserInformationJSON.token))
                return this.handleLogout();

            return await this.getSpecificUserInformation(seeSpecificUserInformationJSON);
        } else if (inputCommand.startsWith("endorseAUserSkill")) {
            let endorseAUserSkillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /endorseAUserSkill ({.+})/, "endorse a user skill");
            if (endorseAUserSkillJSON === undefined)
                return endorseAUserSkillJSON;
            if (await this.authenticationDataAccess.isTokenExpired(endorseAUserSkillJSON.token))
                return this.handleLogout();

            return await this.endorseSkill(endorseAUserSkillJSON);
        } else {
            return "invalid command";
        }
    }

    async editProfileMenuCommandsHandler(inputCommand) {
        if (inputCommand.startsWith("register ")) {

            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /register ({.+})/, "user Information");
            if (userInformationJSON === undefined)
                return userInformationJSON;
            return await this.registerUser(userInformationJSON);

        } else if (inputCommand.startsWith("removeSkill")) {

            let removeSkillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /removeSkill ({.+})/, "remove Skill");
            if (removeSkillJSON === undefined)
                return removeSkillJSON;
            if (await this.authenticationDataAccess.isTokenExpired(removeSkillJSON.token))
                return this.handleLogout();

            return await this.removeSkill(removeSkillJSON);
        } else if (inputCommand.startsWith("addSkill")) {
            let skillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /addSkill ({.+})/, "add Skill");
            if (skillJSON === undefined)
                return skillJSON;
            if (await this.authenticationDataAccess.isTokenExpired(skillJSON.token))
                return this.handleLogout();
            return await this.addSkill(skillJSON);

        } else if (inputCommand === "logout") {
            return this.handleLogout();
        } else if (inputCommand.startsWith("seeAvailableSkills")) {

            let seeAvailableSkillsJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAvailableSkills ({.+})/, "see available skills");
            if (seeAvailableSkillsJSON === undefined)
                return seeAvailableSkillsJSON;
            if (await this.authenticationDataAccess.isTokenExpired(seeAvailableSkillsJSON.token))
                return this.handleLogout();
            return Application.skillsSet;

        } else if (inputCommand.startsWith("back")) {

            this.setCurrentMenu("userAreaMenu");
            return "welcome to userAreaMenu";

        } else if (inputCommand.startsWith("showProfile")) {

            let showProfileJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /showProfile ({.+})/, "show profile");
            if (showProfileJSON === undefined)
                return showProfileJSON;
            if (await this.authenticationDataAccess.isTokenExpired(showProfileJSON.token))
                return this.handleLogout();
            return await this.showUserProfile(showProfileJSON);

        } else {
            return "invalid command";
        }
    }

    availableCommandsForThisMenu() {
        if (this.currentMenu === "loginRegisterMenu") {
            return "available commands for this menu are:\n1) register\n2) login\n3) end";
        } else if (this.currentMenu === "editProfileMenu") {
            return "available commands for this menu are:\n1) register\n2) logout\n3) addSkill\n" +
                "4) removeSkill\n5) back\n6) showProfile\n7) seeAvailableSkills\n8) end";
        } else if (this.currentMenu === "userAreaMenu") {
            return "available commands for this menu are:\n1)  register\n2)  logout\n" +
                "3)  editProfile\n4)  seeAllAvailableProjectsInformation\n5)  seeSpecificProjectInformation\n" +
                "6)  seeAllUsersInformation\n7)  seeSpecificUserInformation\n8)  bid\n" +
                "9)  endorseAUserSkill\n10) addProject\n11) auction\n12) end";
        }
    }

    async registerUser(userInformationJSON) {
        this.setCurrentMenu("loginRegisterMenu");
        let userFromDatabase = await User.getUserWithId(userInformationJSON.id);
        if (userFromDatabase !== undefined) {
            return "there is a user with this id";
        }
        let user = new User(userInformationJSON.id, userInformationJSON.firstName, userInformationJSON.lastName, userInformationJSON.jobTitle,
            undefined, [], [], [], [], userInformationJSON.bio, userInformationJSON.profilePictureURL, []);
        await User.addUser(user);
        return await this.authenticationDataAccess.sendRegisterInformationToServer(userInformationJSON.id, userInformationJSON.password);
    }

    async loginUser(userInformationJSON) {  // id , password ,
        let user;
        user = await User.getUserWithId(userInformationJSON.id);
        if (user === undefined) {
            return "there is not any users with this id";
        }
        let responseFromServer = await this.authenticationDataAccess.sendLoginInformationToServer(userInformationJSON.id, userInformationJSON.password);
        if (responseFromServer.message === "password is wrong") {
            return "password is wrong";
        } else if (responseFromServer.message === "no users with this id") {
            return "no users with this id";
        }
        let token = responseFromServer.token;
        this.setCurrentMenu('userAreaMenu');
        return token + "\n" + "login successful";
    }

    handleLogout() {
        this.setCurrentMenu("loginRegisterMenu");
        return "logged out successfully";
    }

    static convertSkillJSONListToObject(skillsJSON) {
        let skills = [];
        for (let i = 0; i < skillsJSON.length; i++) {
            let skillJSON = skillsJSON[i];
            skills.push(new Skill(skillJSON.skillName, skillJSON.points));
        }
        return skills;
    }

    async addProject(projectInformationJSON) {
        this.setCurrentMenu("userAreaMenu");
        let tokenOwnerId = await this.authenticationDataAccess.getUserIdWithToken(projectInformationJSON.token);
        let project, user;
        if (await Project.isThereAnyProjectsWithId(projectInformationJSON.id)) {
            return "there is a project with this id";
        }
        try {
            let skills = Application.convertSkillJSONListToObject(projectInformationJSON.skills);
            project = new Project(projectInformationJSON.id, projectInformationJSON.title, skills, projectInformationJSON.budget, tokenOwnerId,
                [], projectInformationJSON.description, (new Date(projectInformationJSON.deadline)).getTime(), null, projectInformationJSON.imageURL, true);
        } catch (e) {
            return "wrong format in json";
        }
        user = await User.getUserWithId(tokenOwnerId);
        await user.addProjectToActiveProjectsIds(projectInformationJSON.id);
        await Project.addProject(project);
        return "project added successfully";
    }

    async userHasRequiredSkillsForProject(tokenOwnerId, requiredSkills) {
        let userHasRequiredSkills = true;
        let userSkills, tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithId(tokenOwnerId);
        userSkills = await tokenOwnerUser.getSkills();
        requiredSkills.forEach(requireSkill => {
            let requiredSkillInUsersSkills = userSkills.find(userSkill => {
                return requireSkill.skillName === userSkill.skillName && requireSkill.points <= userSkill.points;
            });
            if (requiredSkillInUsersSkills === undefined) {
                userHasRequiredSkills = false;
            }
        });
        return userHasRequiredSkills;
    }

    async addBidOfferToProjectBidList(tokenOwnerId, project, userBudget) {
        let bidOffer = new BidOffer(tokenOwnerId, project.getId(), userBudget);
        await project.addBidOffers(bidOffer);
        return "your request submitted";
    }

    async submitBidForProject(bidInformationJSON) {
        let tokenOwnerId = await this.authenticationDataAccess.getUserIdWithToken(bidInformationJSON.token);
        if (!(await Project.isThereAnyProjectsWithId(bidInformationJSON.projectId))) {
            return "there is not any projects with this Id";
        }
        let project;
        project = await Project.getProjectWithProjectId(bidInformationJSON.projectId);
        if (!project.getIsActive()) {
            return "project has been expired";
        } else if (tokenOwnerId === project.getOwnerId()) {
            return "you can't bid your own project";
        } else if (bidInformationJSON.bidAmount > project.getBudget()) {
            return "your bidding budget is greater than projects budget";
        } else if (!(await this.userHasRequiredSkillsForProject(tokenOwnerId, project.getSkills()))) {
            return "you don't have enough skills for this project";
        } else if (project.isThisUserIdSubmittedABid(tokenOwnerId)) {
            return "you cannot submit a bid more than once";
        }
        return await this.addBidOfferToProjectBidList(tokenOwnerId, project, bidInformationJSON.bidAmount);
    }

    static async computePointForBidder(user, project, userBudget) {
        let userSkillsArray;
        userSkillsArray = await user.getSkills();
        let projectRequiredSkillsArray = project.getSkills();
        let sigmaValueArray = projectRequiredSkillsArray.map(function (jobSkill) {
            let userSkillJSON = userSkillsArray.find(userSkill => {
                return jobSkill.skillName === userSkill.skillName
            });
            return Math.pow(userSkillJSON.points - jobSkill.points, 2);
        })
        let sum = 0;
        sigmaValueArray.forEach(value => {
            sum += value;
        })
        return 100000 * sum + project.getBudget() - userBudget;
    }

    static async getUsersFromBidOffersList(bidOffers) {
        let biddersUsers = [];
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let user = await User.getUserWithId(bidOffer.biddingUser);
            biddersUsers.push(user);
        }
        return biddersUsers;
    }

    static async findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project) {
        let winner = biddersUsers[0];
        let winnerBidObject = bidOffers.find(bidOffer => {
            return bidOffer.biddingUser === winner.getId()
        });
        let winnerBidAmount = winnerBidObject.bidAmount;
        let winnerPoint = await Application.computePointForBidder(winner, project, winnerBidAmount);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let bidderUser = await User.getUserWithId(bidOffer.biddingUser);
            let bidPoint = await Application.computePointForBidder(bidderUser, project, bidOffer.bidAmount);
            if (winnerPoint < bidPoint) {
                winner = bidderUser;
                winnerPoint = bidPoint;
            }
        }
        return winner;
    }

    static async getAuctionWinner(projectId) {
        let project, projectOwnerUser;
        project = await Project.getProjectWithProjectId(projectId);
        projectOwnerUser = await User.getUserWithId(project.getOwnerId());
        await project.setIsActive(false);
        await projectOwnerUser.removeProject(projectId);
        let bidOffers = project.getBidOffers();
        let biddersUsers = await Application.getUsersFromBidOffersList(bidOffers);

        if (biddersUsers.length === 0) {
            await project.setWinnerId(null);
            return "no one wins for project for id: " + projectId;
        }

        let winnerUser = await Application.findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project);

        await project.setWinnerId(winnerUser.getId());
        await winnerUser.addProjectToTakenProjectsIds(projectId);
        return winnerUser.getId() + " wins! for project with id: " + projectId;
    }

    async handleAuction(auctionInformationJSON) {
        let tokenOwnerId = await this.authenticationDataAccess.getUserIdWithToken(auctionInformationJSON.token);
        let project = await Project.getProjectWithProjectIdWithActive(auctionInformationJSON.projectId, true);
        if (project === undefined) {
            return "there is not any projects with this id";
        } else if (project.isActive === false) {
            return "there is not any active projects with this id";
        } else if (project.getOwnerId() !== tokenOwnerId) {
            return "you can not auction a project which you are not its owner";
        }
        return await Application.getAuctionWinner(auctionInformationJSON.projectId);
    }

    async endorseSkill(endorseAUserSkillJSON) {
        let user, tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(endorseAUserSkillJSON.token, this.authenticationDataAccess);
        user = await User.getUserWithId(endorseAUserSkillJSON.endorsedUserId);
        if (user === undefined) {
            return "there is not any users with this id";
        } else if (endorseAUserSkillJSON.endorsedUserId === tokenOwnerUser.getId()) {
            return "you can not endorse your own skill";
        }

        if (!(await user.isThisUserHasThisSkill(endorseAUserSkillJSON.skillName))) {
            return "user don't have this skill";
        } else if (await tokenOwnerUser.isThisUserEndorsedThisSkillForThisUser(endorseAUserSkillJSON.skillName, user.getId())) {
            return "you can not endorse this skill for this user more than once";
        }

        await tokenOwnerUser.addToEndorsedOtherUsersSkillsList(new Endorsement(user.getId(), tokenOwnerUser.getId(), endorseAUserSkillJSON.skillName));
        await user.increaseSkillPoints(endorseAUserSkillJSON.skillName);
        return "endorsed successfully";
    }

    async getAllUsersInformation() {
        let allUsers;
        allUsers = await User.getAllUsers();
        let allUsersInformation = "----------------------\n";
        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i];
            allUsersInformation += "" + (i + 1) + ") " + user.getId() + "\n";
        }
        allUsersInformation += "----------------------\n";
        return allUsersInformation;
    }

    async showUserProfile(showProfileJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(showProfileJSON.token, this.authenticationDataAccess);
        return "----------------------\n" + await tokenOwnerUser.getUserSummary() + "----------------------\n";
    }

    async checkUserBidNeedThisSkill(tokenOwnerUser, skillName) {
        let allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            let userSubmittedBid = false;
            let projectNeedThisSkill = false;
            let temp = project.getBidOffers().find(bidOffer => {
                return bidOffer.biddingUser === tokenOwnerUser.getId() && project.getIsActive();
            });
            if (temp !== undefined)
                userSubmittedBid = true;

            temp = project.getSkills().find(skill => {
                return skill.skillName === skillName && project.getIsActive();
            });
            if (temp !== undefined) {
                projectNeedThisSkill = true;
            }

            if (userSubmittedBid && projectNeedThisSkill) {
                return "you cannot remove this skill because you bid for some project which needed this skill";
            }
        }
        return "skill removed successfully";
    }

    async setNewSkillsAfterRemovingASkill(tokenOwnerUser, skillName) {
        await tokenOwnerUser.removeSkill(skillName);
    }

    async setNewEndorseListAfterRemoveASkill(tokenOwnerUser, skillName) {
        let allUsers;
        allUsers = await User.getAllUsers();
        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i];
            let endorsedOtherUsersSkillsList;
            endorsedOtherUsersSkillsList = await user.getEndorsedOtherUsersSkillsList();
            let newEndorsedOtherUsersSkillsList = endorsedOtherUsersSkillsList.filter(endorsedObject => {
                if (!(endorsedObject.endorsedUserId === tokenOwnerUser.getId() && endorsedObject.skillName === skillName)) {
                    return endorsedObject;
                }
            });
            await user.setEndorsedOtherUsersSkillsList(newEndorsedOtherUsersSkillsList);
        }
    }

    async removeSkill(skillJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(skillJSON.token, this.authenticationDataAccess);
        if (!(await tokenOwnerUser.isThisUserHasThisSkill(skillJSON.skillName)))
            return "you don't have this skill";
        let removeSkillMessage = await this.checkUserBidNeedThisSkill(tokenOwnerUser, skillJSON.skillName);
        if (removeSkillMessage === "you cannot remove this skill because you bid for some project which needed this skill")
            return removeSkillMessage;

        await this.setNewSkillsAfterRemovingASkill(tokenOwnerUser, skillJSON.skillName);
        await this.setNewEndorseListAfterRemoveASkill(tokenOwnerUser, skillJSON.skillName);
        return removeSkillMessage;
    }

    async getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(seeAllAvailableProjectsInformationJSON.token, this.authenticationDataAccess);
        let allProjectsSummary = "----------------------\n", allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            let condition = await this.userHasRequiredSkillsForProject(project.getSkills());
            if (condition && tokenOwnerUser.getId() !== project.getOwnerId() && project.getIsActive()) {
                allProjectsSummary += project.getProjectSummary();
                allProjectsSummary += "----------------------\n";
            }
        }
        return allProjectsSummary;
    }

    async getSpecificProjectInformation(projectIdJSON) {
        let project;
        project = await Project.getProjectWithProjectId(projectIdJSON.id);
        if (project === undefined) {
            return "there is not any projects with this id";
        }
        return "----------------------\n" + project.getProjectSummary() + "----------------------\n";
    }

    async getSpecificUserInformation(userIdJSON) {
        let user;
        user = await User.getUserWithId(userIdJSON.id);
        if (user === undefined)
            return "there is not any users with this id";
        return "----------------------\n" + await user.getUserSummary() + "----------------------\n";
    }

    isThisSkillInSkillsSet(skill) {
        let flag = Application.skillsSet.find(skillInSkillsSet => {
            return skillInSkillsSet.skillName === skill.skillName;
        });
        return flag !== undefined;

    }

    async addSkill(skillJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(skillJSON.token, this.authenticationDataAccess);
        if (!this.isThisSkillInSkillsSet(skillJSON)) {
            return "there is not any skills in skills set with this name";
        } else if (await tokenOwnerUser.isThisUserHasThisSkill(skillJSON.skillName)) {
            return "you already have this skill";
        }
        await tokenOwnerUser.addSkill(new Skill(skillJSON.skillName, skillJSON.points));
        return "skill added successfully";
    }

}

function schedulerForCheckProjectsDeadline() {
    cron.schedule('*/2 * * * *', async () => {
        await Application.checkProjectsDeadlinesPassed();
    }, {
        scheduled: true
    });
}

(async () => {
    await Application.runDatabase();
    schedulerForCheckProjectsDeadline();
    await Application.getSkillsAndProjectsFromServer();
    console.log("skills are ready");
    const application = new Application();
    await application.runApplication();
})();


module.exports = Application;
