const knex = require('../DatabaseConfig/knex');
let stdin = process.openStdin();
const User = require("../Model/User");
const Project = require("../Model/Project");

class Application {
    static loginRegisterMenuCommands = ["register", "login", "end"];
    static userAreaMenuCommands = ["register", "logout", "editProfile", "seeAllAvailableProjectsInformation", "seeSpecificProjectInformation"
        , "seeAllUsersInformation", "seeSpecificUserInformation", "bid", "endorseAUserSkill", "addProject", "auction", "end"];
    static editProfileMenuCommands = ["register", "logout", "addSkill",
        "removeSkill", "back", "showProfile", "seeAvailableSkills", "end"];
    static currentMenu;

    constructor() {
        Application.setCurrentMenu("loginRegisterMenu");
    }

    static setCurrentMenu(menu) {
        Application.currentMenu = menu;
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
            await application.handleCommandsWithMenu(inputCommand, Application.currentMenu);
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
            if (String(userInformationJSON).startsWith("wrong format for"))
                return userInformationJSON;
            return await this.registerUser(userInformationJSON);
        } else if (inputCommand.startsWith("login ")) {
            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /login ({.+})/, "user Information");
            if (String(userInformationJSON).startsWith("wrong format for"))
                return userInformationJSON;
            return await this.loginUser(userInformationJSON);
        } else {
            return "invalid command";
        }
    }

    async userAreaMenuCommandsHandler(inputCommand) {
        if (inputCommand.startsWith("register ")) {
            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /register ({.+})/, "user Information");
            if (String(userInformationJSON).startsWith("wrong format for"))
                return userInformationJSON;
            return await this.registerUser(userInformationJSON);

        } else if (inputCommand.startsWith("addProject ")) {
            let projectInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /addProject ({.+})/, "project Information");
            if (String(projectInformationJSON).startsWith("wrong format for"))
                return projectInformationJSON;
            if ((await User.isTokenExpired(projectInformationJSON.token)))
                return Application.handleLogout();
            return await this.addProject(projectInformationJSON);

        } else if (inputCommand.startsWith("bid ")) {
            let bidInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /bid ({.+})/, "bid Information");
            if (String(bidInformationJSON).startsWith("wrong format for"))
                return bidInformationJSON;
            if ((await User.isTokenExpired(bidInformationJSON.token)))
                return Application.handleLogout();

            return await this.submitBidForProject(bidInformationJSON);
        } else if (inputCommand.startsWith("auction ")) {
            let auctionInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /auction ({.+})/, "auction Information");
            if (String(auctionInformationJSON).startsWith("wrong format for"))
                return auctionInformationJSON;
            if ((await User.isTokenExpired(auctionInformationJSON.token)))
                return Application.handleLogout();

            return await this.handleAuction(auctionInformationJSON);
        } else if (inputCommand.startsWith("seeAllUsersInformation")) {
            let seeAllUsersInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAllUsersInformation ({.+})/, "see all users information");
            if (String(seeAllUsersInformationJSON).startsWith("wrong format for"))
                return seeAllUsersInformationJSON;
            if ((await User.isTokenExpired(seeAllUsersInformationJSON.token)))
                return Application.handleLogout();
            return await this.getAllUsersInformation();

        } else if (inputCommand.startsWith("logout")) {
            return Application.handleLogout();
        } else if (inputCommand.startsWith("editProfile")) {

            let editProfileJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /editProfile ({.+})/, "edit profile");
            if (String(editProfileJSON).startsWith("wrong format for"))
                return editProfileJSON;
            if ((await User.isTokenExpired(editProfileJSON.token)))
                return Application.handleLogout();
            Application.setCurrentMenu("editProfileMenu");
            return "welcome to editProfileMenu";

        } else if (inputCommand.startsWith("seeAllAvailableProjectsInformation")) {

            let seeAllAvailableProjectsInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAllAvailableProjectsInformationJSON ({.+})/, "see all available projects");
            if (String(seeAllAvailableProjectsInformationJSON).startsWith("wrong format for"))
                return seeAllAvailableProjectsInformationJSON;
            if (await User.isTokenExpired(seeAllAvailableProjectsInformationJSON.token))
                return Application.handleLogout();
            return await this.getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON);

        } else if (inputCommand.startsWith("seeSpecificProjectInformation")) {
            let seeSpecificProjectInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificProjectInformation ({.+})/, "see a specific project information");
            if (String(seeSpecificProjectInformationJSON).startsWith("wrong format for"))
                return seeSpecificProjectInformationJSON;
            if (await User.isTokenExpired(seeSpecificProjectInformationJSON.token))
                return Application.handleLogout();

            return await this.getSpecificProjectInformation(seeSpecificProjectInformationJSON);
        } else if (inputCommand.startsWith("seeSpecificUserInformation")) {
            let seeSpecificUserInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificUserInformation ({.+})/, "see a specific user information");
            if (String(seeSpecificUserInformationJSON).startsWith("wrong format for"))
                return seeSpecificUserInformationJSON;
            if (await User.isTokenExpired(seeSpecificUserInformationJSON.token))
                return Application.handleLogout();

            return await this.getSpecificUserInformation(seeSpecificUserInformationJSON);
        } else if (inputCommand.startsWith("endorseAUserSkill")) {
            let endorseAUserSkillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /endorseAUserSkill ({.+})/, "endorse a user skill");
            if (String(endorseAUserSkillJSON).startsWith("wrong format for"))
                return endorseAUserSkillJSON;
            if (await User.isTokenExpired(endorseAUserSkillJSON.token))
                return Application.handleLogout();

            return await this.endorseSkill(endorseAUserSkillJSON);
        } else {
            return "invalid command";
        }
    }

    async editProfileMenuCommandsHandler(inputCommand) {
        if (inputCommand.startsWith("register ")) {

            let userInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /register ({.+})/, "user Information");
            if (String(userInformationJSON).startsWith("wrong format for"))
                return userInformationJSON;
            return await this.registerUser(userInformationJSON);

        } else if (inputCommand.startsWith("removeSkill")) {

            let removeSkillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /removeSkill ({.+})/, "remove Skill");
            if (String(removeSkillJSON).startsWith("wrong format for"))
                return removeSkillJSON;
            if (await User.isTokenExpired(removeSkillJSON.token))
                return Application.handleLogout();

            return await this.removeSkill(removeSkillJSON);
        } else if (inputCommand.startsWith("addSkill")) {

            let skillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /addSkill ({.+})/, "add Skill");
            if (String(skillJSON).startsWith("wrong format for"))
                return skillJSON;
            if (await User.isTokenExpired(skillJSON.token))
                return Application.handleLogout();
            return await this.addSkill(skillJSON);

        } else if (inputCommand === "logout") {
            return Application.handleLogout();
        } else if (inputCommand.startsWith("seeAvailableSkills")) {

            let seeAvailableSkillsJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeAvailableSkills ({.+})/, "see available skills");
            if (String(seeAvailableSkillsJSON).startsWith("wrong format for"))
                return seeAvailableSkillsJSON;
            if (await User.isTokenExpired(seeAvailableSkillsJSON.token))
                return Application.handleLogout();
            return Application.skillsSet;

        } else if (inputCommand.startsWith("back")) {

            Application.setCurrentMenu("userAreaMenu");
            return "welcome to userAreaMenu";

        } else if (inputCommand.startsWith("showProfile")) {

            let showProfileJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /showProfile ({.+})/, "show profile");
            if (String(showProfileJSON).startsWith("wrong format for"))
                return showProfileJSON;
            if (await User.isTokenExpired(showProfileJSON.token))
                return Application.handleLogout();
            return await this.showUserProfile(showProfileJSON);

        } else {
            return "invalid command";
        }
    }

    availableCommandsForThisMenu() {
        if (Application.currentMenu === "loginRegisterMenu") {
            return "available commands for this menu are:\n1) register\n2) login\n3) end";
        } else if (Application.currentMenu === "editProfileMenu") {
            return "available commands for this menu are:\n1) register\n2) logout\n3) addSkill\n" +
                "4) removeSkill\n5) back\n6) showProfile\n7) seeAvailableSkills\n8) end";
        } else if (Application.currentMenu === "userAreaMenu") {
            return "available commands for this menu are:\n1)  register\n2)  logout\n" +
                "3)  editProfile\n4)  seeAllAvailableProjectsInformation\n5)  seeSpecificProjectInformation\n" +
                "6)  seeAllUsersInformation\n7)  seeSpecificUserInformation\n8)  bid\n" +
                "9)  endorseAUserSkill\n10) addProject\n11) auction\n12) end";
        }
    }

    async registerUser(userInformationJSON) {
        try {
            Application.setCurrentMenu("loginRegisterMenu");
            await User.registerUser(userInformationJSON);
            return "register successful";
        } catch (e) {
            return e;
        }
    }

    async loginUser(userInformationJSON) {
        try {
            let token = await User.loginUser(userInformationJSON)
            Application.setCurrentMenu('userAreaMenu');
            return token + "\n" + "login successful";
        } catch (e) {
            return e;
        }

    }

    async addProject(projectInformationJSON) {
        try {
            await Project.addProject(projectInformationJSON);
            return "project added successfully";
        } catch (e) {
            return e;
        }
    }

    async submitBidForProject(bidInformationJSON) {
        try {
            await Project.submitBidForProject(bidInformationJSON)
            return "your request submitted";
        } catch (e) {
            return e;
        }
    }

    async handleAuction(auctionInformationJSON) {
        try {
            return await Project.handleAuction(auctionInformationJSON);
        } catch (e) {
            return e;
        }
    }

    async endorseSkill(endorseAUserSkillJSON) {
        try {
            await User.endorseSkill(endorseAUserSkillJSON);
            return "endorsed successfully";
        } catch (e) {
            return e;
        }
    }

    async getAllUsersInformation() {
        try {
            return await User.getAllUsersInformation();
        } catch (e) {
            return e;
        }
    }

    async showUserProfile(showProfileJSON) {
        try {
            return await User.showUserProfile(showProfileJSON)
        } catch (e) {
            return e;
        }
    }

    async removeSkill(skillJSON) {
        try {
            await User.removeSkill(skillJSON);
            return "skill removed successfully";
        } catch (e) {
            return e;
        }
    }

    async getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON) {
        try {
            return await User.getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON);

        } catch (e) {
            return e;
        }
    }

    async getSpecificProjectInformation(projectIdJSON) {
        try {
            return await Project.getSpecificProjectInformation(projectIdJSON);
        } catch (e) {
            return e;
        }
    }

    async getSpecificUserInformation(userIdJSON) {
        try {
            return await User.getSpecificUserInformation(userIdJSON);
        } catch (e) {
            return e;
        }
    }

    async addSkill(skillJSON) {
        try {
            await User.addSkill(skillJSON)
            return "skill added successfully"
        } catch (e) {
            return e;
        }
    }

    static handleLogout() {
        Application.setCurrentMenu("loginRegisterMenu");
        return "logged out successfully";
    }
}


(async () => {
    await User.setupApplication();
    const application = new Application();
    await application.runApplication();
})();


module.exports = Application;

