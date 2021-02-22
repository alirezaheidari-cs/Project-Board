const ServerDataAccess = require('../Model/ServerDataAccess.js');
const DatabaseHandler = require('../Model/DatabaseHandler.js');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');
const readlineSync = require('readline-sync');

/*
id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, isActive, imageURL
id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL

register {"id":"user1","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","skills":[{"skillName":"CSS","points":50}],"bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user2","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","skills":[{"skillName":"CSS","points":50}],"bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user3","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":60},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}
register {"id":"user4","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":70},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}
register {"id":"user5","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":60},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}
register {"id":"user6","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":60},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}

addProject {"id":1,"title":"project1","skills":[{"skillName":"HTML","points":10},{"skillName":"CSS","points":20}],"budget":10,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa"}
addProject {"id":2,"title":"project2","skills":[{"skillName":"HTML","points":20},{"skillName":"CSS","points":20}],"budget":1,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa"}
addProject {"id":3,"title":"project3","skills":[{"skillName":"HTML","points":20}],"budget":100,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa"}

bid {"biddingUser":"user5","projectId":1,"bidAmount":1}
bid {"biddingUser":"user3","projectId":1,"bidAmount":10}
bid {"biddingUser":"user4","projectId":1,"bidAmount":1}

auction {"projectId":1}

removeSkill {"skillName":"HTML"}
removeSkill {"skillName":"CSS"}
removeSkill {"skillName":"JAVA"}

endorseAUserSkill {"endorsedUserId":"user5","skillName":"CSS"}
seeSpecificProjectInformation {"id":1}
seeSpecificUserInformation {"id":"user3"}
addSkill {"skillName":"JAVA","points":120}

*/
class Application {
    static loginRegisterMenuCommands = ["register", "logout", "end"];
    static userAreaMenuCommands = ["register", "logout", "editProfile", "seeAllAvailableProjectsInformation", "seeSpecificProjectInformation"
        , "seeAllUsersInformation", "seeSpecificUserInformation", "bid", "endorseAUserSkill", "addProject", "auction", "end"];
    static editProfileMenuCommands = ["register", "logout", "addSkill",
        "removeSkill", "back", "showProfile", "seeAvailableSkills", "end"];

    constructor() {
        this.currentMenu = "loginRegisterMenu";
        this.skillsSet = [];
        this.loggedInUser = undefined;
    }

    setCurrentMenu(menu) {
        this.currentMenu = menu;
    }

    setLoggedInUser(user) {
        this.loggedInUser = user;
    }

    async runApplication(port) {
        const serverDataAccess = new ServerDataAccess(port);
        const dataBaseHandler = new DatabaseHandler();
        await dataBaseHandler.runDataBase();
        this.skillsSet = await serverDataAccess.getSkillsFromServer();
        await serverDataAccess.getProjectsFromServer();
        let allProjectsDataJSON = await serverDataAccess.getProjectsFromServer();
        await this.convertProjectJSONToProjectObject(allProjectsDataJSON);

        console.log("data caught from sever");

        await this.checkProjectsDeadlinesPassed();
        await this.readCommandsFromConsole();
    }

    async convertProjectJSONToProjectObject(allProjectsDataJSON) {
        if (allProjectsDataJSON !== undefined) {
            for (let i = 0; i < allProjectsDataJSON.length; i++) {
                let projectData = allProjectsDataJSON[i];
                let project = new Project(projectData.id, projectData.title, projectData.skills, projectData.budget, projectData.ownerId,
                    projectData.bidOffers, projectData.description, (new Date(projectData.deadline)).getTime(), projectData.winnerId, projectData.imageURL, projectData.isActive);
                await Project.addProject(project);
            }
        }
    }

    async checkProjectsDeadlinesPassed() {
        let currentDate = new Date(), allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            if (project.deadline < currentDate.getTime() && project.getIsActive()) {
                await this.getAuctionWinner(project.getId());
            }
        }
    }

    async readCommandsFromConsole() {
        let inputCommand = "";
        while (true) {
            inputCommand = await readlineSync.question('');
            if (inputCommand === "end")
                break;
            await this.handleCommandsWithMenu(inputCommand, this.currentMenu);
        }
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
            return await this.addProject(projectInformationJSON);
        } else if (inputCommand.startsWith("bid ")) {
            let bidInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /bid ({.+})/, "bid Information");
            if (bidInformationJSON === undefined)
                return bidInformationJSON;
            return await this.submitBidForProject(bidInformationJSON);
        } else if (inputCommand.startsWith("auction ")) {
            let auctionInformationJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /auction ({.+})/, "auction Information");
            if (auctionInformationJSON === undefined)
                return auctionInformationJSON;
            return await this.handleAuction(auctionInformationJSON);
        } else if (inputCommand === ("seeAllUsersInformation")) {
            return await this.getAllUsersInformation();
        } else if (inputCommand.startsWith("logout")) {
            return this.handleLogout();
        } else if (inputCommand === "editProfile") {
            this.setCurrentMenu("editProfileMenu");
            return "welcome to editProfileMenu";
        } else if (inputCommand === "seeAllAvailableProjectsInformation") {
            return await this.getAllAvailableProjectsInformationForUser();
        } else if (inputCommand.startsWith("seeSpecificProjectInformation")) {
            let projectIdJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificProjectInformation ({.+})/, "see a specific project information");
            if (projectIdJSON === undefined)
                return projectIdJSON;
            return await this.getSpecificProjectInformation(projectIdJSON);
        } else if (inputCommand.startsWith("seeSpecificUserInformation")) {
            let userIdJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /seeSpecificUserInformation ({.+})/, "see a specific user information");
            if (userIdJSON === undefined)
                return userIdJSON;
            return await this.getSpecificUserInformation(userIdJSON);
        } else if (inputCommand.startsWith("endorseAUserSkill")) {
            let endorseAUserSkillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /endorseAUserSkill ({.+})/, "endorse a user skill");
            if (endorseAUserSkillJSON === undefined)
                return endorseAUserSkillJSON;
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
            return await this.removeSkill(removeSkillJSON);
        } else if (inputCommand.startsWith("addSkill")) {
            let skillJSON = Application.getJSONPartOfCommandWithGivenRegex(inputCommand, /addSkill ({.+})/, "add Skill");
            if (skillJSON === undefined)
                return skillJSON;
            return await this.addSkill(skillJSON);
        } else if (inputCommand === "logout") {
            return this.handleLogout();
        } else if (inputCommand === "seeAvailableSkills") {
            return this.skillsSet;
        } else if (inputCommand === "back") {
            this.setCurrentMenu("userAreaMenu");
            return "welcome to userAreaMenu";
        } else if (inputCommand === "showProfile") {
            return this.showUserProfile();
        } else {
            return "invalid command";
        }
    }

    availableCommandsForThisMenu() {
        if (this.currentMenu === "loginRegisterMenu") {
            return "available commands for this menu are:\n1) register|login\n2) end";
        } else if (this.currentMenu === "editProfileMenu") {
            return "available commands for this menu are:\n1) register|login\n2) logout\n3) addSkill\n" +
                "4) removeSkill\n5) back\n6) showProfile\n7) seeAvailableSkills\n8) end";
        } else if (this.currentMenu === "userAreaMenu") {
            return "available commands for this menu are:\n1)  register|login\n2)  logout\n" +
                "3)  editProfile\n4)  seeAllAvailableProjectsInformation\n5)  seeSpecificProjectInformation\n" +
                "6)  seeAllUsersInformation\n7)  seeSpecificUserInformation\n8)  bid\n" +
                "9)  endorseAUserSkill\n10) addProject\n11) auction\n12) end";
        }
    }

    async registerUser(userInformationJSON) {
        this.setCurrentMenu("userAreaMenu");
        let userFromDatabase = await User.getUserWithId(userInformationJSON.id);
        if (userFromDatabase === undefined) {
            let user = new User(userInformationJSON.id, userInformationJSON.firstName, userInformationJSON.lastName, userInformationJSON.jobTitle,
                userInformationJSON.skills, [], [], [], userInformationJSON.bio, userInformationJSON.profilePictureURL, []);
            this.setLoggedInUser(user);
            await User.addUser(user);
            return "registration successful";
        }
        this.setLoggedInUser(userFromDatabase);
        return "login successful";
    }

    handleLogout() {
        this.setCurrentMenu("loginRegisterMenu");
        this.setLoggedInUser(undefined);
        return "logged out successfully";
    }

    async addProject(projectInformationJSON) {
        this.setCurrentMenu("userAreaMenu");
        let project = undefined;
        if (await Project.isThereAnyProjectsWithId(projectInformationJSON.id))
            return "there is a project with this id";
        try {
            project = new Project(projectInformationJSON.id, projectInformationJSON.title, projectInformationJSON.skills, projectInformationJSON.budget, this.loggedInUser.getId(),
                [], projectInformationJSON.description, (new Date(projectInformationJSON.deadline)).getTime(), null, projectInformationJSON.imageURL, true);
        } catch (e) {
            return "wrong format in json";
        }
        await this.loggedInUser.addProjectToActiveProjectsIds(projectInformationJSON.id);
        await Project.addProject(project);
        return "project added successfully";
    }

    async userHasRequiredSkillsForProject(requiredSkills) {
        let userHasRequiredSkills = true;
        let userSkills;
        userSkills = await this.loggedInUser.getSkills();
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

    async addBidOfferToProjectBidList(project, userBudget) {
        await project.addBidOffers({
            "biddingUser": this.loggedInUser.getId(),
            "projectId": project.getId(),
            "bidAmount": userBudget
        });
        return "your request submitted";
    }

    async submitBidForProject(bidInformationJSON) {
        if (bidInformationJSON.biddingUser !== this.loggedInUser.getId()) {
            return "you can't bid for someone else";
        } else if (!(await Project.isThereAnyProjectsWithId(bidInformationJSON.projectId))) {
            return "there is not any projects with this Id";
        }
        let project;
        project = await Project.getProjectWithProjectId(bidInformationJSON.projectId);
        if (!project.getIsActive()) {
            return "project has been expired";
        } else if (bidInformationJSON.biddingUser === project.getOwnerId()) {
            return "you can't bid your own project";
        } else if (bidInformationJSON.bidAmount > project.getBudget()) {
            return "your bidding budget is greater than projects budget";
        } else if (!(await this.userHasRequiredSkillsForProject(project.getSkills()))) {
            return "you don't have enough skills for this project";
        } else if (project.isThisUserIdSubmittedABid(this.loggedInUser.getId())) {
            return "you cannot submit a bid more than once";
        }
        return await this.addBidOfferToProjectBidList(project, bidInformationJSON.bidAmount);
    }

    async computePointForBidder(user, project, userBudget) {
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

    async getUsersFromBidOffersList(bidOffers) {
        let biddersUsers = [];
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let user = await User.getUserWithId(bidOffer.biddingUser);
            biddersUsers.push(user);
        }
        return biddersUsers;
    }

    async findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project) {
        let winner = biddersUsers[0];
        let winnerBidJSON = bidOffers.find(bidOffer => {
            return bidOffer.biddingUser === winner.getId()
        });
        let winnerBidAmount = winnerBidJSON.bidAmount;
        let winnerPoint = await this.computePointForBidder(winner, project, winnerBidAmount);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let bidderUser = await User.getUserWithId(bidOffer.biddingUser);
            let bidPoint = await this.computePointForBidder(bidderUser, project, bidOffer.bidAmount);
            if (winnerPoint < bidPoint) {
                winner = bidderUser;
                winnerPoint = bidPoint;
            }
        }
        return winner;
    }

    async getAuctionWinner(projectId) {
        let project, projectOwnerUser;
        project = await Project.getProjectWithProjectId(projectId);
        projectOwnerUser = await User.getUserWithId(project.getOwnerId());
        await project.setIsActive(false);
        await projectOwnerUser.removeProject(projectId);
        let bidOffers = project.getBidOffers();

        let biddersUsers = await this.getUsersFromBidOffersList(bidOffers);

        if (biddersUsers.length === 0) {
            await project.setWinnerId(null);
            return "no one wins for project for id: " + projectId;
        }

        let winnerUser = await this.findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project);

        await project.setWinnerId(winnerUser.getId());
        await winnerUser.addProjectToTakenProjectsIds(projectId);
        return winnerUser.getId() + " wins! for project with id: " + projectId;
    }

    async handleAuction(auctionInformationJSON) {
        let project = await Project.getProjectWithProjectIdWithActive(auctionInformationJSON.projectId, true);
        if (project === undefined) {
            return "there is not any projects with this id";
        } else if (project.isActive === false) {
            return "there is not any active projects with this id";
        } else if (project.getOwnerId() !== this.loggedInUser.getId()) {
            return "you can not auction a project which you are not its owner";
        }
        return await this.getAuctionWinner(auctionInformationJSON.projectId);
    }

    async endorseSkill(endorseAUserSkillJSON) {
        let user;
        user = await User.getUserWithId(endorseAUserSkillJSON.endorsedUserId);
        if (user === undefined) {
            return "there is not any users with this id";
        } else if (endorseAUserSkillJSON.endorsedUserId === this.loggedInUser.getId()) {
            return "you can not endorse your own skill";
        }

        if (!(await user.isThisUserHasThisSkill(endorseAUserSkillJSON.skillName))) {
            return "user don't have this skill";
        } else if (await this.loggedInUser.isThisUserEndorsedThisSkillForThisUser(endorseAUserSkillJSON.skillName, user.getId())) {
            return "you can not endorse this skill for this user more than once";
        }
        await this.loggedInUser.addToEndorsedOtherUsersSkillsList({
            "endorsedUserId": user.getId(),
            "skillName": endorseAUserSkillJSON.skillName
        });
        await user.increaseSkillPoints(endorseAUserSkillJSON.endorsedUserId, endorseAUserSkillJSON.skillName);
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

    async showUserProfile() {
        return "----------------------\n" + await this.loggedInUser.getUserSummary() + "----------------------\n";
    }

    async checkUserBidNeedThisSkill(skillName) {
        let allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            let userSubmittedBid = false;
            let projectNeedThisSkill = false;
            let temp = project.getBidOffers().find(bidOffer => {
                return bidOffer.biddingUser === this.loggedInUser.getId() && project.getIsActive();
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

    async setNewSkillsAfterRemovingASkill(skillName) {
        await this.loggedInUser.removeSkill(skillName);
    }

    async setNewEndorseListAfterRemoveASkill(skillName) {
        let allUsers;
        allUsers = await User.getAllUsers();
        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i];
            let endorsedOtherUsersSkillsList;
            endorsedOtherUsersSkillsList = await user.getEndorsedOtherUsersSkillsList();
            let newEndorsedOtherUsersSkillsList = endorsedOtherUsersSkillsList.filter(endorsedObject => {
                if (!(endorsedObject.endorsedUserId === this.loggedInUser.getId() && endorsedObject.skillName === skillName)) {
                    return endorsedObject;
                }
            });
            await user.setEndorsedOtherUsersSkillsList(newEndorsedOtherUsersSkillsList);
        }
    }

    async removeSkill(skillJSON) {
        if (!(await this.loggedInUser.isThisUserHasThisSkill(skillJSON.skillName)))
            return "you don't have this skill";
        let removeSkillMessage = await this.checkUserBidNeedThisSkill(skillJSON.skillName);
        if (removeSkillMessage === "you cannot remove this skill because you bid for some project which needed this skill")
            return removeSkillMessage;

        await this.setNewSkillsAfterRemovingASkill(skillJSON.skillName);
        await this.setNewEndorseListAfterRemoveASkill(skillJSON.skillName);
        return removeSkillMessage;
    }

    async getAllAvailableProjectsInformationForUser() {
        let allProjectsSummary = "----------------------\n", allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            let condition = await this.userHasRequiredSkillsForProject(project.getSkills());
            if (condition && this.loggedInUser.getId() !== project.getOwnerId() && project.getIsActive()) {
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
        let flag = this.skillsSet.find(skillInSkillsSet => {
            return skillInSkillsSet.skillName === skill.skillName;
        });
        return flag !== undefined;

    }

    async addSkill(skillJSON) {
        if (!this.isThisSkillInSkillsSet(skillJSON)) {
            return "there is not any skills in skills set with this name";
        } else if (await this.loggedInUser.isThisUserHasThisSkill(skillJSON.skillName)) {
            return "you already have this skill";
        }
        await this.loggedInUser.addSkill(skillJSON);
        return "skill added successfully";
    }
}

(async () => {
    const application = new Application();
    // setInterval(Application.checkProjectsDeadlinesPassed, 120000);
    await application.runApplication(8080);
})()


module.exports = Application;
