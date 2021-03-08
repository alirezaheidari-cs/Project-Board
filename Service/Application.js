var stdin = process.openStdin();
const ApplicationController = require('../Model/ApplicationController')

/*
login {"id":"user1","password":"alireza"}
addProject {"id":3,"title":"project3","skills":[{"skillName":"HTML","points":20}],"budget":100,"ownerId":"user1","description":"goood","deadline":"2021/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUyMjEwMTcsImlkIjoidXNlcjEifQ.L1vw6Y-WItGavrSrE3-236uAKGmtobOZh3qTI8khJH4"}
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
addProject {"id":2,"title":"project2","skills":[{"skillName":"HTML","points":20},{"skillName":"CSS","points":20}],"budget":1,"description":"goood","deadline":"2001/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUyMjEwMTcsImlkIjoidXNlcjEifQ.L1vw6Y-WItGavrSrE3-236uAKGmtobOZh3qTI8khJH4"}

addProject {"id":3,"title":"project2","skills":[{"skillName":"HTML","points":20},{"skillName":"CSS","points":20}],"budget":1,"description":"goood","deadline":"2010/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3Mjk1NDAsImlkIjoidXNlcjEifQ.rJsgv3a-XvV_i4GopeKnLIsyAuNxPRRRmWEr9ndiXVI"}
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ2NTkzMDEsImlkIjoidXNlcjEifQ.d1K5GDINPY2gdiSrx0qSW4z1CKCnRODsPFBVSQmvYk0

login {"id":"user1","password":"alireza"}
addProject {"id":3,"title":"project3","skills":[{"skillName":"HTML","points":20}],"budget":100,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3Mjk1NDAsImlkIjoidXNlcjEifQ.rJsgv3a-XvV_i4GopeKnLIsyAuNxPRRRmWEr9ndiXVI"}
bid {"projectId":3,"bidAmount":1,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3MDQ1NTcsImlkIjoidXNlcjMifQ.LbBiyY1yJ-D5Rr4GO1nwQ6-yWhEeHib2iJafnm8qz6Y"}
auction {"projectId":1,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNTYwMTEsImlkIjoidXNlcjEifQ.Oia7hGhSkfTwShp9JQAeNHuyj96m3RSXAREVxz88t8U"}
editProfile {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ3MDQ1NTcsImlkIjoidXNlcjMifQ.LbBiyY1yJ-D5Rr4GO1nwQ6-yWhEeHib2iJafnm8qz6Y"}
removeSkill {"skillName":"HTML","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUxODYsImlkIjoidXNlcjEifQ.bGifla6IEEwzJ796Dcqw9qzLDng1REvvOfgDwuvtKVY"}
seeAllUsersInformation {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTQ0MTMyMDksImlkIjoidXNlcjEifQ.n3Zfb3VmgfDzKi-w-zeSat1ITZAA4ykaDcH48jLk6VM"}
endorseAUserSkill {"endorsedUserId":"user1","skillName":"HTML","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUwNjUyNzAsImlkIjoidXNlcjIifQ.k1Xs5-qyoJLtGs7Cg-wDvXWX5pwn75fzLwOiCtDokrg"}
seeSpecificProjectInformation {"id":1,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUxMzY4ODcsImlkIjoidXNlcjEifQ.Zu_w9xyMPOe8f1CaOk5orXgVh7GjrBXoKB8cQ5u6b9s"}
seeSpecificUserInformation {"id":"user2" ,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUxMzY4ODcsImlkIjoidXNlcjEifQ.Zu_w9xyMPOe8f1CaOk5orXgVh7GjrBXoKB8cQ5u6b9s"}
addSkill {"skillName":"HTML","points":19,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTUxMzY4ODcsImlkIjoidXNlcjEifQ.Zu_w9xyMPOe8f1CaOk5orXgVh7GjrBXoKB8cQ5u6b9s"}
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


    constructor() {
        this.applicationController = new ApplicationController();
    }

    async runApplication() {
        await this.readCommandsFromConsole();
    }

    async readCommandsFromConsole() {
        let inputCommand = "";
        let application = this
        stdin.addListener("data", async function (input) {
            inputCommand = input.toString().trim();
            if (inputCommand === "end") {
                process.exit(1)
            }
            await application.handleCommandsWithMenu(inputCommand, application.applicationController.currentMenu);
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
            if ((await this.applicationController.isTokenExpired(projectInformationJSON.token)))
                return this.applicationController.handleLogout();
            return await this.addProject(projectInformationJSON);

        } else if (inputCommand.startsWith("bid ")) {
            let bidInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /bid ({.+})/, "bid Information");
            if (bidInformationJSON === undefined)
                return bidInformationJSON;
            if ((await this.applicationController.isTokenExpired(bidInformationJSON.token)))
                return this.applicationController.handleLogout();

            return await this.submitBidForProject(bidInformationJSON);
        } else if (inputCommand.startsWith("auction ")) {
            let auctionInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /auction ({.+})/, "auction Information");
            if (auctionInformationJSON === undefined)
                return auctionInformationJSON;
            if ((await this.applicationController.isTokenExpired(auctionInformationJSON.token)))
                return this.applicationController.handleLogout();

            return await this.handleAuction(auctionInformationJSON);
        } else if (inputCommand.startsWith("seeAllUsersInformation")) {
            let seeAllUsersInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAllUsersInformation ({.+})/, "see all users information");
            if (seeAllUsersInformationJSON === undefined)
                return seeAllUsersInformationJSON;
            if ((await this.applicationController.isTokenExpired(seeAllUsersInformationJSON.token)))
                return this.applicationController.handleLogout();
            return await this.getAllUsersInformation();

        } else if (inputCommand.startsWith("logout")) {
            return this.applicationController.handleLogout();
        } else if (inputCommand.startsWith("editProfile")) {

            let editProfileJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /editProfile ({.+})/, "edit profile");
            if (editProfileJSON === undefined)
                return editProfileJSON;
            if ((await this.applicationController.isTokenExpired(editProfileJSON.token)))
                return this.applicationController.handleLogout();
            this.applicationController.setCurrentMenu("editProfileMenu");
            return "welcome to editProfileMenu";

        } else if (inputCommand.startsWith("seeAllAvailableProjectsInformation")) {

            let seeAllAvailableProjectsInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAllAvailableProjectsInformationJSON ({.+})/, "see all available projects");
            if (seeAllAvailableProjectsInformationJSON === undefined)
                return seeAllAvailableProjectsInformationJSON;
            if (await this.applicationController.isTokenExpired(seeAllAvailableProjectsInformationJSON.token))
                return this.applicationController.handleLogout();
            return await this.getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON);

        } else if (inputCommand.startsWith("seeSpecificProjectInformation")) {
            let seeSpecificProjectInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificProjectInformation ({.+})/, "see a specific project information");
            if (seeSpecificProjectInformationJSON === undefined)
                return seeSpecificProjectInformationJSON;
            if (await this.applicationController.isTokenExpired(seeSpecificProjectInformationJSON.token))
                return this.applicationController.handleLogout();

            return await this.getSpecificProjectInformation(seeSpecificProjectInformationJSON);
        } else if (inputCommand.startsWith("seeSpecificUserInformation")) {
            let seeSpecificUserInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificUserInformation ({.+})/, "see a specific user information");
            if (seeSpecificUserInformationJSON === undefined)
                return seeSpecificUserInformationJSON;
            if (await this.applicationController.isTokenExpired(seeSpecificUserInformationJSON.token))
                return this.applicationController.handleLogout();

            return await this.getSpecificUserInformation(seeSpecificUserInformationJSON);
        } else if (inputCommand.startsWith("endorseAUserSkill")) {
            let endorseAUserSkillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /endorseAUserSkill ({.+})/, "endorse a user skill");
            if (endorseAUserSkillJSON === undefined)
                return endorseAUserSkillJSON;
            if (await this.applicationController.isTokenExpired(endorseAUserSkillJSON.token))
                return this.applicationController.handleLogout();

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
            if (await this.applicationController.isTokenExpired(removeSkillJSON.token))
                return this.applicationController.handleLogout();

            return await this.removeSkill(removeSkillJSON);
        } else if (inputCommand.startsWith("addSkill")) {
            let skillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /addSkill ({.+})/, "add Skill");
            if (skillJSON === undefined)
                return skillJSON;
            if (await this.applicationController.isTokenExpired(skillJSON.token))
                return this.applicationController.handleLogout();
            return await this.addSkill(skillJSON);

        } else if (inputCommand === "logout") {
            return this.applicationController.handleLogout();
        } else if (inputCommand.startsWith("seeAvailableSkills")) {

            let seeAvailableSkillsJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAvailableSkills ({.+})/, "see available skills");
            if (seeAvailableSkillsJSON === undefined)
                return seeAvailableSkillsJSON;
            if (await this.applicationController.isTokenExpired(seeAvailableSkillsJSON.token))
                return this.applicationController.handleLogout();
            return Application.skillsSet;

        } else if (inputCommand.startsWith("back")) {

            this.applicationController.setCurrentMenu("userAreaMenu");
            return "welcome to userAreaMenu";

        } else if (inputCommand.startsWith("showProfile")) {

            let showProfileJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /showProfile ({.+})/, "show profile");
            if (showProfileJSON === undefined)
                return showProfileJSON;
            if (await this.applicationController.isTokenExpired(showProfileJSON.token))
                return this.applicationController.handleLogout();
            return await this.showUserProfile(showProfileJSON);

        } else {
            return "invalid command";
        }
    }

    availableCommandsForThisMenu() {
        if (this.applicationController.currentMenu === "loginRegisterMenu") {
            return "available commands for this menu are:\n1) register\n2) login\n3) end";
        } else if (this.applicationController.currentMenu === "editProfileMenu") {
            return "available commands for this menu are:\n1) register\n2) logout\n3) addSkill\n" +
                "4) removeSkill\n5) back\n6) showProfile\n7) seeAvailableSkills\n8) end";
        } else if (this.applicationController.currentMenu === "userAreaMenu") {
            return "available commands for this menu are:\n1)  register\n2)  logout\n" +
                "3)  editProfile\n4)  seeAllAvailableProjectsInformation\n5)  seeSpecificProjectInformation\n" +
                "6)  seeAllUsersInformation\n7)  seeSpecificUserInformation\n8)  bid\n" +
                "9)  endorseAUserSkill\n10) addProject\n11) auction\n12) end";
        }
    }

    async registerUser(userInformationJSON) {
        return await this.applicationController.registerUser(userInformationJSON)
    }

    async loginUser(userInformationJSON) {  // id , password ,
        return await this.applicationController.loginUser(userInformationJSON)
    }


    async addProject(projectInformationJSON) {
        return await this.applicationController.addProject(projectInformationJSON)
    }

    async submitBidForProject(bidInformationJSON) {
        return await this.applicationController.submitBidForProject(bidInformationJSON)
    }

    async handleAuction(auctionInformationJSON) {
        return await this.applicationController.handleAuction(auctionInformationJSON);
    }

    async endorseSkill(endorseAUserSkillJSON) {
        return await this.applicationController.endorseSkill(endorseAUserSkillJSON);
    }

    async getAllUsersInformation() {
        return await this.applicationController.getAllUsersInformation();
    }

    async showUserProfile(showProfileJSON) {
        return await this.applicationController.showUserProfile(showProfileJSON)
    }


    async removeSkill(skillJSON) {
        return await this.applicationController.removeSkill(skillJSON);
    }

    async getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON) {
        return await this.applicationController.getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON);
    }

    async getSpecificProjectInformation(projectIdJSON) {
        return await this.applicationController.getSpecificProjectInformation(projectIdJSON);
    }

    async getSpecificUserInformation(userIdJSON) {
        return await this.applicationController.getSpecificUserInformation(userIdJSON);
    }

    async addSkill(skillJSON) {
        return await this.applicationController.addSkill(skillJSON)
    }

}


(async () => {
    const application = new Application();
    await ApplicationController.runDataAccessClasses();
    await application.runApplication();
})();


module.exports = Application;
