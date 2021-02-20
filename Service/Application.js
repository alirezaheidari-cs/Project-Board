const ServerDatabasePreprocessor = require('../Model/ServerDatabasePreprocesoor.js');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');
const fs = require('fs');
const readlineSync = require('readline-sync');

/*
id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, isActive, imageURL
id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL

register {"id":"user1","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","skills":[{"skillName":"CSS","points":50}],"bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user2","firstName":"hamid","lastName":"yaghobi","jobTitle":"AI","skills":[{"skillName":"CSS","points":50}],"bio":"olympiad","profilePictureURL":"gog"}
register {"id":"user3","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":60},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}
register {"id":"user4","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":70},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}
register {"id":"user5","firstName":"amin","lastName":"davood","jobTitle":"AI","skills":[{"skillName":"HTML","points":60},{"skillName":"CSS","points":60}],"bio":"soccer player","profilePictureURL":"gppg"}

addProject {"id":1,"title":"project1","skills":[{"skillName":"HTML","points":10},{"skillName":"CSS","points":20}],"budget":10,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa"}
addProject {"id":2,"title":"project2","skills":[{"skillName":"HTML","points":20},{"skillName":"CSS","points":20}],"budget":1,"description":"goood","deadline":"2021/10/10","imageURL":"asfaa"}

bid {"biddingUser":"user4","projectId":1,"bidAmount":2}
bid {"biddingUser":"user3","projectId":2,"bidAmount":1}
bid {"biddingUser":"user4","projectId":1,"bidAmount":1}

auction {"projectId":2}

removeSkill {"skillName":"HTML"}
removeSkill {"skillName":"CSS"}

endorseAUserSkill {"id":"user5","skillName":"CSS"}
seeSpecificProjectInformation {"id":1}
seeSpecificUserInformation {"id":"user3"}
addSkill {"skillName":"JAVA","points":10}
let skillsSet = [];
*/
class Application {
    static serverDatabasePreprocessor;
    static skillsSet = [];
    static loggedInUser;
    static currentMenu = "loginRegisterMenu";
    static loginRegisterMenuCommands = ["register", "logout", "end"];
    static userAreaMenuCommands = ["register", "logout", "editProfile", "seeAllAvailableProjectsInformation", "seeSpecificProjectInformation"
        , "seeAllUsersInformation", "seeSpecificUserInformation", "bid", "endorseAUserSkill", "addProject", "auction", "end"];
    static editProfileMenuCommands = ["register", "logout", "addSkill",
        "removeSkill", "back", "showProfile", "seeAvailableSkills", "end"];

    constructor() {

    }

    static async runApplication(port) {
        Application.serverDatabasePreprocessor = new ServerDatabasePreprocessor(port);
        await Application.serverDatabasePreprocessor.runDataBase();
        Application.skillsSet = await Application.serverDatabasePreprocessor.getSkillsFromServer();
        let allProjectsDataJSON = await Application.serverDatabasePreprocessor.getProjectsFromServer();
        await Application.convertProjectJSONToProjectObject(allProjectsDataJSON);
        console.log("data caught from sever");
        await Application.checkProjectsDeadlinesPassed();
        await Application.readCommandsFromConsole();
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


    // static async importProjectsAndUsersDataFromDatabase(usersFilePath, projectsFilePath) {
    //     let allUsersDataJSON, allProjectsDataJSON;
    //     try {
    //         let allUserDataString = await fs.readFileSync(usersFilePath);
    //         allUsersDataJSON = JSON.parse(allUserDataString);
    //
    //     } catch (e) {
    //
    //     }
    //     if (allUsersDataJSON != undefined) {
    //         allUsersDataJSON.forEach(userData => {
    //             let user = new User();
    //             user.setUserInformation(userData.id, userData.firstName, userData.lastName, userData.jobTitle, userData.skills,
    //                 userData.activeProjectsIds, userData.inactiveProjectsIds, userData.takenProjectsIds, userData.bio, userData.profilePictureURL, userData.endorsedOtherUsersSkillsList);
    //             User.addUser(user);
    //         });
    //     }
    //
    //     try {
    //         let allProjectsDataString = await fs.readFileSync(projectsFilePath);
    //         allProjectsDataJSON = JSON.parse(allProjectsDataString);
    //     } catch (e) {
    //
    //     }
    //     if (allProjectsDataJSON !== undefined) {
    //         allProjectsDataJSON.forEach(projectData => {
    //             if (!Project.isThereAnyProjectsWithId(projectData.id)) {
    //                 let project = new Project(projectData.id, projectData.title, projectData.skills, projectData.budget, projectData.ownerId,
    //                     projectData.bidOffers, projectData.description, (new Date(projectData.deadline)).getTime(), projectData.winnerId, projectData.imageURL, projectData.isActive);
    //                 Project.addProject(project);
    //             }
    //         });
    //     }
    // }

    static async checkProjectsDeadlinesPassed() {
        let currentDate = new Date();
        let allProjects = await Project.getAllProjects();
        let allProjectsLength = 0;
        for (let allProjectKey in allProjects) {
            allProjectsLength += 1;
        }
        for (let i = 0; i < allProjectsLength; i++) {
            let project = allProjects[i];
            if (project.deadline < currentDate.getTime() && project.isActive) {
                await Application.computeAuctionWinner(project.getId());
            }
        }
    }

    static async handleRegisterUser(userInformationJSON) {
        Application.currentMenu = "userAreaMenu";
        let user = new User();
        user.setUserInformation(userInformationJSON.id, userInformationJSON.firstName, userInformationJSON.lastName, userInformationJSON.jobTitle,
            userInformationJSON.skills, [], [], [], userInformationJSON.bio, userInformationJSON.profilePictureURL, []);
        Application.loggedInUser = user;
        let flag = await User.isThereAnyUserWithId(userInformationJSON.id);
        if (flag)
            return "login successful";

        await User.addUser(user);
        return "registration successful";
    }

    static handleLogout() {
        Application.currentMenu = "loginRegisterMenu";
        Application.loggedInUser = undefined;
        return "logged out successfully";
    }

    static async handleAddProject(projectInformationJSON) {
        Application.currentMenu = "userAreaMenu";
        let project = undefined;
        let flag = await Project.isThereAnyProjectsWithId(projectInformationJSON.id);
        if (flag)
            return "there is a project with this id";

        try {
            project = new Project(projectInformationJSON.id, projectInformationJSON.title, projectInformationJSON.skills, projectInformationJSON.budget, Application.loggedInUser.getId(),
                [], projectInformationJSON.description, (new Date(projectInformationJSON.deadline)).getTime(), -1, projectInformationJSON.imageURL, true);
        } catch (e) {
            return "wrong format in json";
        }
        await Application.loggedInUser.addProjectToActiveProjectsIds(projectInformationJSON.id);
        await Project.addProject(project);
        return "project added successfully";
    }

    static availableCommandsForThisMenu() {
        if (Application.currentMenu === "loginRegisterMenu") {
            return "available commands for this menu are:\n1) register|login\n2) end";
        } else if (Application.currentMenu === "editProfileMenu") {
            return "available commands for this menu are:\n1) register|login\n2) logout\n3) addSkill\n" +
                "4) removeSkill\n5) back\n6) showProfile\n7) seeAvailableSkills\n8) end";
        } else if (Application.currentMenu === "userAreaMenu") {
            return "available commands for this menu are:\n1)  register|login\n2)  logout\n" +
                "3)  editProfile\n4)  seeAllAvailableProjectsInformation\n5)  seeSpecificProjectInformation\n" +
                "6)  seeAllUsersInformation\n7)  seeSpecificUserInformation\n8)  bid\n" +
                "9)  endorseAUserSkill\n10) addProject\n11) auction\n12) end";
        }
    }

    static userHasRequiredSkillsForProject(requiredSkills) {
        let result = true;
        let userSkills = Application.loggedInUser.getSkills();
        requiredSkills.forEach(requireSkill => {
            let flag = false;
            userSkills.forEach(userSkill => {
                if (requireSkill.skillName === userSkill.skillName && requireSkill.points <= userSkill.points)
                    flag = true;
            });
            if (flag === false)
                result = false;
        });
        return result;
    }

    static async adjustBiddingUser(project, userBudget) {
        await project.addBidOffers({
            "biddingUser": Application.loggedInUser.getId(),
            "projectId": project.getId(),
            "bidAmount": userBudget
        });
        return "your request submitted";
    }

    static async handleBid(bidInformationJSON) {
        if (bidInformationJSON.biddingUser !== Application.loggedInUser.getId()) {
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
        } else if (!Application.userHasRequiredSkillsForProject(project.getSkills())) {
            return "you don't have enough skills for this project";
        } else if (project.isThisUserIdSubmittedABid(Application.loggedInUser.getId())) {
            return "you cannot submit a bid more than once";
        }
        return await Application.adjustBiddingUser(project, bidInformationJSON.bidAmount);
    }

    static async computePointForBidder(user, project, userBudget) {
        let userSkillsArray = user.getSkills();
        let projectRequiredSkillsArray = project.getSkills();
        let sigmaValueArray = projectRequiredSkillsArray.map(function (jobSkill) {
            let userSkillPoint = -1;
            userSkillsArray.forEach(skill => {
                if (jobSkill.skillName === skill.skillName) {
                    userSkillPoint = skill.points;
                }
            })
            return Math.pow(userSkillPoint - jobSkill.points, 2);
        })
        let sum = 0;
        sigmaValueArray.forEach(value => {
            sum += value;
        })
        return 100000 * sum + project.getBudget() - userBudget;
    }

    static async computeAuctionWinner(projectId) {
        let project, projectOwnerUser;
        project = await Project.getProjectWithProjectId(projectId);
        projectOwnerUser = await User.getUserWithId(project.getOwnerId());
        let bidOffers = project.getBidOffers();
        let biddersUsers = [];
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let user = await User.getUserWithId(bidOffer.biddingUser);
            biddersUsers.push(user);
        }

        await project.setIsActive(false);
        try {
            await projectOwnerUser.removeProject(projectId);
        } catch (e) {
            console.log(e)
        }

        if (biddersUsers.length === 0) {
            await project.setWinnerId(-1);
            return "no one wins for project for id: " + projectId;
        }
        let winner = biddersUsers[0];
        let winnerBidAmount = 0;
        bidOffers.forEach(bidOffer => {
            if (bidOffer.biddingUser === winner.getId()) {
                winnerBidAmount = bidOffer.bidAmount;
            }
        });
        let winnerPoint = await Application.computePointForBidder(winner, project, bidOffers[0].bidAmount);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let bidderUser = await User.getUserWithId(bidOffer.biddingUser);
            let bidPoint = await Application.computePointForBidder(bidderUser, project, bidOffer.bidAmount);
            if (winnerPoint < bidPoint) {
                winner = bidderUser;
                winnerPoint = bidPoint;
            }
        }
        await project.setWinnerId(winner.getId());
        await winner.addProjectToTakenProjectsIds(projectId);
        return winner.getId() + " wins! for project with id: " + projectId;
    }

    static async handleAuction(auctionInformationJSON) {
        let project;
        project = await Project.getProjectWithProjectIdWithActive(auctionInformationJSON.projectId, true);
        if (project === undefined) {
            return "there is not any projects with this id";
        } else if (project.isActive == 0) {
            return "there is not any projects with this id";
        }


        if (project.getOwnerId() !== Application.loggedInUser.getId())
            return "you can not auction a project which you are not its owner";
        return await Application.computeAuctionWinner(auctionInformationJSON.projectId);
    }

    static async handleEndorseAUserSkill(endorseAUserSkillJSON) {
        if (!(await User.isThereAnyUserWithId(endorseAUserSkillJSON.id))) {
            return "there is not any users with this id";
        } else if (endorseAUserSkillJSON.id === Application.loggedInUser.getId()) {
            return "you can not endorse your own skill";
        }
        let user;
        user = await User.getUserWithId(endorseAUserSkillJSON.id);
        if (!(user.isThisUserHasThisSkill(endorseAUserSkillJSON.skillName))) {
            return "user don't have this skill";
        } else if (Application.loggedInUser.isThisUserEndorsedThisSkillForThisUser(endorseAUserSkillJSON.skillName, user.getId())) {
            return "you can not endorse this skill for this user more than once";
        }
        await Application.loggedInUser.addToEndorsedOtherUsersSkillsList({
            "id": user.getId(),
            "skillName": endorseAUserSkillJSON.skillName
        });
        await user.increaseSkillPoints(endorseAUserSkillJSON.skillName);
        return "endorsed successfully";
    }

    static async handleSeeAllUsersInformation() {
        let allUsers = await User.getAllUsers();
        let allUsersLength = 0;
        for (let allUsersKey in allUsers) {
            allUsersLength += 1;
        }
        let allUsersInformation = '';
        for (let i = 0; i < allUsersLength; i++) {
            let user = allUsers[i];

            allUsersInformation += "" + (i + 1) + ") " + user.getId() + "\n";

        }
        return allUsersInformation;
    }

    static handleShowProfile() {
        return Application.loggedInUser.getUserSummary();
    }

    static async removeSkill(skillName) {
        let userFlag = false, skillFlag = false;
        let removeSkillMessage = "skill removed successfully";
        try {
            let allProjects = await Project.getAllProjects();
            let allProjectsLength = 0;
            for (let allProjectsKey in allProjects) {
                allProjectsLength += 1;
            }
            for (let i = 0; i < allProjectsLength; i++) {
                let project = allProjects[i];

                userFlag = false;
                skillFlag = false;
                if (project.getIsActive()) {
                    project.getBidOffers().forEach(bidOffer => {
                        if (bidOffer.biddingUser === Application.loggedInUser.getId()) {
                            userFlag = true;
                        }
                    });
                    project.getSkills().forEach(requiredSkill => {
                        if (requiredSkill.skillName === skillName) {
                            skillFlag = true;
                        }
                    });
                }

                if (userFlag && skillFlag) {
                    removeSkillMessage = "you cannot remove this skill because you bid for some project which needed this skill";
                }
            }
        } catch (e) {

        }
        if (removeSkillMessage === "you cannot remove this skill because you bid for some project which needed this skill")
            return removeSkillMessage;

        let newSkillsList = Application.loggedInUser.getSkills().filter(skill => {
            if (skill.skillName !== skillName) {
                return skill;
            }
        });
        await Application.loggedInUser.setSkills(newSkillsList);
        let allUsers = [];
        allUsers = await User.getAllUsers();

        let allUsersLength = 0
        for (let allUserKey in allUsers) {
            allUsersLength += 1;
        }
        for (let i = 0; i < allUsersLength; i++) {
            let user = allUsers[i];
            let newEndorsedOtherUsersSkillsList = user.getEndorsedOtherUsersSkillsList().filter(endorsedObject => {
                if (!(endorsedObject.endorsedUserId === Application.loggedInUser.getId() && endorsedObject.skillName === skillName)) {
                    return endorsedObject;
                }
            });
            await user.setEndorsedOtherUsersSkillsList(newEndorsedOtherUsersSkillsList);
        }
        return removeSkillMessage;
    }

    static async handleRemoveSkill(skillJSON) {
        if (!(Application.loggedInUser.isThisUserHasThisSkill(skillJSON.skillName)))
            return "you don't have this skill";
        return await Application.removeSkill(skillJSON.skillName);
    }

    static async handleSeeAllAvailableProjectsInformation() {
        let allProjectsSummary = "----------------------\n";
        let allProjects = await Project.getAllProjects();
        let allProjectsLength = 0;
        for (let allProjectKey in allProjects) {
            allProjectsLength += 1;
        }
        for (let i = 0; i < allProjectsLength; i++) {
            let project = allProjects[i];
            if (Application.userHasRequiredSkillsForProject(project.getSkills()) && Application.loggedInUser.getId() !== project.getOwnerId() && project.getIsActive()) {
                allProjectsSummary += project.getProjectSummary();
                allProjectsSummary += "----------------------\n";
            }
        }
        return allProjectsSummary;
    }

    static async handleSeeSpecificProjectInformation(projectIdJSON) {
        if (!(await Project.isThereAnyProjectsWithId(projectIdJSON.id))) {
            return "there is not any projects with this id";
        }
        let project;
        project = await Project.getProjectWithProjectId(projectIdJSON.id);
        return "----------------------\n" + project.getProjectSummary() + "----------------------\n";
    }

    static async handleSeeSpecificUserInformation(userIdJSON) {
        if (!(await User.isThereAnyUserWithId(userIdJSON.id)))
            return "there is not any users with this id";
        let user;
        user = await User.getUserWithId(userIdJSON.id);
        return user.getUserSummary();
    }

    static isThisSkillInSkillsSet(skill) {
        let flag = false;
        try {
            Application.skillsSet.forEach(skillInSkillsSet => {
                if (skillInSkillsSet.skillName === skill.skillName) {
                    flag = true;
                }
            });
        } catch (e) {

        }
        return flag;
    }

    static async handleAddSkill(skillJSON) {
        if (!Application.isThisSkillInSkillsSet(skillJSON)) {
            return "there is not any skills in skills set with this name";
        } else if (await Application.loggedInUser.isThisUserHasThisSkill(skillJSON.skillName)) {
            return "you already have this skill";
        }
        await Application.loggedInUser.addSkill(skillJSON);
        return "skill added successfully";
    }

    static async readCommandsFromConsole() {
        let inputCommand = "";
        while (true) {
            inputCommand = await readlineSync.question('');
            if (inputCommand === "end")
                break;

            await Application.handleCommandsWithMenu(inputCommand, Application.currentMenu);
        }
    }

    //
    // static writeToDatabase(usersPath, projectsPath) {
    //     const allUsersJsonString = JSON.stringify(User.allUsers);
    //     const allProjectsJsonString = JSON.stringify(Project.allProjects);
    //     try {
    //         fs.writeFileSync(usersPath, allUsersJsonString);
    //     } catch (e) {
    //         console.log(e.message);
    //     }
    //     try {
    //         fs.writeFileSync(projectsPath, allProjectsJsonString);
    //     } catch (e) {
    //         console.log(e.message);
    //     }
    //     process.exit(22);
    // }

    static async handleCommandsWithMenu(inputCommand, currentMenu) {
        let message = "";
        try {
            if (currentMenu === "loginRegisterMenu") {
                for (let i = 0; i < Application.loginRegisterMenuCommands.length; i++) {
                    let availableCommand = Application.loginRegisterMenuCommands[i];
                    if (inputCommand.startsWith(availableCommand) || inputCommand === availableCommand) {
                        message = await Application.handleLoginRegisterMenuCommands(inputCommand);
                        break;
                    }
                }
            } else if (currentMenu === "userAreaMenu") {
                for (let i = 0; i < Application.userAreaMenuCommands.length; i++) {
                    let availableCommand = Application.userAreaMenuCommands[i];
                    if (inputCommand.startsWith(availableCommand) || inputCommand === availableCommand) {
                        message = await Application.handleUserAreaMenu(inputCommand);
                        break;
                    }
                }
            } else if (currentMenu === "editProfileMenu") {
                for (let i = 0; i < Application.editProfileMenuCommands.length; i++) {
                    let availableCommand = Application.editProfileMenuCommands[i];
                    if (inputCommand.startsWith(availableCommand) || inputCommand === availableCommand) {
                        message = await Application.handleEditProfileMenu(inputCommand);
                        break;
                    }
                }
            }
        } catch (e) {

        }
        console.log(message);
        console.log(Application.availableCommandsForThisMenu());
    }

    static async handleLoginRegisterMenuCommands(inputCommand) {
        if (inputCommand.startsWith("register ")) {
            let matcher = /register ({.+})/.exec(inputCommand);
            let userInformationJSON = "wrong format for user information";
            try {
                userInformationJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(userInformationJSON);
                return;
            }
            return await Application.handleRegisterUser(userInformationJSON);
        } else {
            return "invalid command";
        }
    }

    static async handleUserAreaMenu(inputCommand) {
        if (inputCommand.startsWith("register ")) {
            let matcher = /register ({.+})/.exec(inputCommand);
            let userInformationJSON = "wrong format for user information";
            try {
                userInformationJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(userInformationJSON);
                return;
            }
            return await Application.handleRegisterUser(userInformationJSON);
        } else if (inputCommand.startsWith("addProject ")) {
            let matcher = /addProject ({.+})/.exec(inputCommand);
            let projectInformationJSON = "wrong format for project information";
            try {
                projectInformationJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(projectInformationJSON);
                return;
            }
            return await Application.handleAddProject(projectInformationJSON);
        } else if (inputCommand.startsWith("bid ")) {

            let matcher = /bid ({.+})/.exec(inputCommand);
            let bidInformationJSON = "wrong format for bid information";
            try {
                bidInformationJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(bidInformationJSON);
                return;
            }
            return await Application.handleBid(bidInformationJSON);
        } else if (inputCommand.startsWith("auction ")) {
            let matcher = /auction ({.+})/.exec(inputCommand);
            let auctionInformationJSON = "wrong format for auction information";
            try {
                auctionInformationJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(auctionInformationJSON);
                return;
            }
            return await Application.handleAuction(auctionInformationJSON);
        } else if (inputCommand === ("seeAllUsersInformation")) {
            return await Application.handleSeeAllUsersInformation();
        } else if (inputCommand.startsWith("logout")) {
            return Application.handleLogout();
        } else if (inputCommand === "editProfile") {
            Application.currentMenu = "editProfileMenu";
            return "welcome to editProfileMenu";
        } else if (inputCommand === "seeAllAvailableProjectsInformation") {
            return await Application.handleSeeAllAvailableProjectsInformation();
        } else if (inputCommand.startsWith("seeSpecificProjectInformation")) {
            let matcher = /seeSpecificProjectInformation ({.+})/.exec(inputCommand);
            let projectIdJSON = "wrong format for see a specific project information";
            try {
                projectIdJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(projectIdJSON);
                return;
            }
            return await Application.handleSeeSpecificProjectInformation(projectIdJSON);
        } else if (inputCommand.startsWith("seeSpecificUserInformation")) {
            let matcher = /seeSpecificUserInformation ({.+})/.exec(inputCommand);
            let userIdJSON = "wrong format for see a specific user information";
            try {
                userIdJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(userIdJSON);
                return;
            }
            return await Application.handleSeeSpecificUserInformation(userIdJSON);
        } else if (inputCommand.startsWith("endorseAUserSkill")) {
            let matcher = /endorseAUserSkill ({.+})/.exec(inputCommand);
            let endorseAUserSkillJSON = "wrong format for endorse a user skill";
            try {
                endorseAUserSkillJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(endorseAUserSkillJSON);
                return;
            }
            return await Application.handleEndorseAUserSkill(endorseAUserSkillJSON);
        } else {
            return "invalid command";
        }
    }

    static async handleEditProfileMenu(inputCommand) {
        if (inputCommand.startsWith("register ")) {
            let matcher = /register ({.+})/.exec(inputCommand);
            let userInformationJSON = "wrong format for user information";
            try {
                userInformationJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(userInformationJSON);
                return;
            }
            return await Application.handleRegisterUser(userInformationJSON);
        } else if (inputCommand.startsWith("removeSkill")) {
            let matcher = /removeSkill ({.+})/.exec(inputCommand);
            let removeSkillJSON = "wrong format for remove Skill";
            try {
                removeSkillJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(removeSkillJSON);
                return;
            }
            return await Application.handleRemoveSkill(removeSkillJSON);
        } else if (inputCommand.startsWith("addSkill")) {
            let matcher = /addSkill ({.+})/.exec(inputCommand);
            let skillJSON = "wrong format for add Skill";
            try {
                skillJSON = JSON.parse(matcher[1]);
            } catch (e) {
                console.log(skillJSON);
                return;
            }
            return await Application.handleAddSkill(skillJSON);
        } else if (inputCommand === "logout") {
            return Application.handleLogout();
        } else if (inputCommand === "seeAvailableSkills") {
            return Application.skillsSet;
        } else if (inputCommand === "back") {
            Application.currentMenu = "userAreaMenu";
            return "welcome to userAreaMenu";
        } else if (inputCommand === "showProfile") {
            return Application.handleShowProfile();
        } else {
            return "invalid command";
        }
    }

    // static readCommandsFromFile() {
    // const rl = readline.createInterface({
    //     input: fs.createReadStream('commands'),
    //     output: process.stdout,
    //     terminal: false
    // });
    // rl.on('line', (inputCommand) => {
    //     handleCommandsWithMenu(inputCommand, currentMenu);
    // });
    // const allInputCommands = fs.readFileSync('commands').toString().split('\n');
    // for (const inputCommand of allInputCommands) {
    //
    // }
    // }

}

(async () => {

    await Application.runApplication(8080);
})()


module.exports = Application;
