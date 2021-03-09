const cron = require("node-cron");
const User = require('./User.js');
const Project = require('./Project.js');
const ServerDataAccess = require('../DataAccess/ServerDataAccess.js');
const AuthenticationDataAccess = require('../DataAccess/AuthenticationDataAccess.js');
const Skill = require('./Skill');
const BidOffer = require('./BidOffer');
const Endorsement = require('./Endorsement');

class ApplicationController {
    static skillsSet;
    static authenticationPort = 9999;
    static serverPort = 8080;

    constructor() {
        this.currentMenu = "loginRegisterMenu";
        this.authenticationDataAccess = new AuthenticationDataAccess(ApplicationController.authenticationPort);
    }

    static async runDataAccessClasses() {
        new Project()
        new User()
        await ApplicationController.getSkillsAndProjectsFromServer();
        ApplicationController.schedulerForCheckProjectsDeadline();
        console.log("skills are ready");
    }

    async isTokenExpired(token) {
        return await this.authenticationDataAccess.isTokenExpired(token);
    }

    async getUserIdWithToken(token) {
        return await this.authenticationDataAccess.getUserIdWithToken(token)
    }

    static schedulerForCheckProjectsDeadline() {
        cron.schedule('*/5 * * * * *', async () => {
            await ApplicationController.checkProjectsDeadlinesPassed();
        }, {
            scheduled: true
        });
    }

    setCurrentMenu(menu) {
        this.currentMenu = menu;
    }

    static async getSkillsAndProjectsFromServer() {
        const serverDataAccess = new ServerDataAccess(ApplicationController.serverPort);
        ApplicationController.skillsSet = await serverDataAccess.getSkillsFromServer();
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
                await ApplicationController.getAuctionWinner(project.getId());
            }
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
            let skills = ApplicationController.convertSkillJSONListToObject(projectInformationJSON.skills);
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
        let winnerPoint = await ApplicationController.computePointForBidder(winner, project, winnerBidAmount);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let bidderUser = await User.getUserWithId(bidOffer.biddingUser);
            let bidPoint = await ApplicationController.computePointForBidder(bidderUser, project, bidOffer.bidAmount);
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
        let biddersUsers = await ApplicationController.getUsersFromBidOffersList(bidOffers);

        if (biddersUsers.length === 0) {
            await project.setWinnerId(null);
            return "no one wins for project for id: " + projectId;
        }

        let winnerUser = await ApplicationController.findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project);

        await project.setWinnerId(winnerUser.getId());
        await winnerUser.addProjectToTakenProjectsIds(projectId);
        return winnerUser.getId() + " wins! for project with id: " + projectId;
    }

    async handleAuction(auctionInformationJSON) {
        let project, tokenOwnerId;
        tokenOwnerId = await this.authenticationDataAccess.getUserIdWithToken(auctionInformationJSON.token);
        project = await Project.getProjectWithProjectIdWithActive(auctionInformationJSON.projectId, true);
        if (project === undefined) {
            return "there is not any projects with this id";
        } else if (project.getIsActive() === false) {
            return "there is not any active projects with this id";
        } else if (project.getOwnerId() !== tokenOwnerId) {
            return "you can not auction a project which you are not its owner";
        }
        return await ApplicationController.getAuctionWinner(auctionInformationJSON.projectId);
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
        let flag = ApplicationController.skillsSet.find(skillInSkillsSet => {
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

module.exports = ApplicationController;