const cron = require("node-cron");
const AuthenticationDataAccess = require('../DataAccess/AuthenticationDataAccess.js');
const Skill = require('./Skill');
const BidOffer = require('./BidOffer');

class Project {
    constructor(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        this.id = id;
        this.title = title;
        this.skills = skills;
        this.budget = budget;
        this.ownerId = ownerId;
        this.bidOffers = bidOffers;
        this.description = description;
        this.deadline = deadline;
        this.winnerId = winnerId;
        this.imageURL = imageURL;
        this.isActive = isActive;
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
        let biddersUsers = [], User;
        User = await Project.getUserInstance();
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let user = await User.getUserWithId(bidOffer.biddingUser);
            biddersUsers.push(user);
        }
        return biddersUsers;
    }

    static async findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project) {
        let winner = biddersUsers[0], User;
        User = await Project.getUserInstance();
        let winnerBidObject = bidOffers.find(bidOffer => {
            return bidOffer.biddingUser === winner.getId()
        });
        let winnerBidAmount = winnerBidObject.bidAmount;
        let winnerPoint = await Project.computePointForBidder(winner, project, winnerBidAmount);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            let bidderUser = await User.getUserWithId(bidOffer.biddingUser);
            let bidPoint = await Project.computePointForBidder(bidderUser, project, bidOffer.bidAmount);
            if (winnerPoint < bidPoint) {
                winner = bidderUser;
                winnerPoint = bidPoint;
            }
        }
        return winner;
    }

    static async getAuctionWinner(projectId) {
        let project, projectOwnerUser, User;
        User = await Project.getUserInstance();
        project = await Project.getProjectWithProjectId(projectId);
        projectOwnerUser = await User.getUserWithId(project.getOwnerId());
        await project.setIsActive(false);
        await projectOwnerUser.removeProject(projectId);
        let bidOffers = project.getBidOffers();
        let biddersUsers = await Project.getUsersFromBidOffersList(bidOffers);

        if (biddersUsers.length === 0) {
            await project.setWinnerId(null);
            return "no one wins for project for id: " + projectId;
        }

        let winnerUser = await Project.findAuctionWinnerInBidOffersList(biddersUsers, bidOffers, project);

        await project.setWinnerId(winnerUser.getId());
        await winnerUser.addProjectToTakenProjectsIds(projectId);
        return winnerUser.getId() + " wins! for project with id: " + projectId;
    }

    static async handleAuction(auctionInformationJSON) {
        let project, tokenOwnerId;
        tokenOwnerId = await AuthenticationDataAccess.getUserIdWithToken(auctionInformationJSON.token);
        project = await Project.getProjectWithProjectIdWithActive(auctionInformationJSON.projectId, true);
        if (project === undefined) {
            throw "there is not any projects with this id";
        } else if (project.getIsActive() === false) {
            throw "there is not any active projects with this id";
        } else if (project.getOwnerId() !== tokenOwnerId) {
            throw "you can not auction a project which you are not its owner";
        }
        return await Project.getAuctionWinner(auctionInformationJSON.projectId);
    }

    static async getSpecificProjectInformation(projectIdJSON) {
        let project;
        project = await Project.getProjectWithProjectId(projectIdJSON.id);
        if (project === undefined) {
            throw "there is not any projects with this id";
        }
        return "----------------------\n" + project.getProjectSummary() + "----------------------\n";
    }

    static async addBidOfferToProjectBidList(tokenOwnerId, project, userBudget) {
        let bidOffer = new BidOffer(tokenOwnerId, project.getId(), parseInt(userBudget));
        await project.addBidOffers(bidOffer);
        return bidOffer;
    }

    static async submitBidForProject(bidInformationJSON) {
        let User, project;
        let tokenOwnerId = await AuthenticationDataAccess.getUserIdWithToken(bidInformationJSON.token);
        if (!(await Project.isThereAnyProjectsWithId(bidInformationJSON.projectId))) {
            throw "there is not any projects with this Id";
        }
        User = await Project.getUserInstance();
        project = await Project.getProjectWithProjectId(bidInformationJSON.projectId);
        if (!project.getIsActive()) {
            throw "project has been expired";
        } else if (tokenOwnerId === project.getOwnerId()) {
            throw "you can't bid your own project";
        } else if (bidInformationJSON.bidAmount > project.getBudget()) {
            throw "your bidding budget is greater than projects budget";
        } else if (!(await User.userHasRequiredSkillsForProject(tokenOwnerId, project.getSkills()))) {
            throw "you don't have enough skills for this project";
        } else if (project.isThisUserIdSubmittedABid(tokenOwnerId)) {
            throw "you cannot submit a bid more than once";
        }
        return await Project.addBidOfferToProjectBidList(tokenOwnerId, project, bidInformationJSON.bidAmount);
    }

    static convertSkillJSONListToObject(skillsJSON) {
        let skills = [];
        for (let i = 0; i < skillsJSON.length; i++) {
            let skillJSON = skillsJSON[i];
            skills.push(new Skill(skillJSON.skillName, parseInt(skillJSON.points)));
        }
        return skills;
    }

    static async addProject(projectInformationJSON) {
        let project, tokenOwnerUser, User;
        User = await Project.getUserInstance();
        tokenOwnerUser = await User.getUserWithToken(projectInformationJSON.token);
        try {
            let skills = Project.convertSkillJSONListToObject(projectInformationJSON.skills);
            project = new Project(projectInformationJSON.id, projectInformationJSON.title, skills, projectInformationJSON.budget, tokenOwnerUser.getId(),
                [], projectInformationJSON.description, (new Date(projectInformationJSON.deadline)).getTime(), null, projectInformationJSON.imageURL, true);
        } catch (e) {
            throw "wrong format in json";
        }
        let response = await Project.addProjectToDatabase(project);
        if (response === undefined)
            throw "there is a project with this id";

        await tokenOwnerUser.addProjectToActiveProjectsIds(projectInformationJSON.id);
        return project;
    }

    static schedulerForCheckProjectsDeadline() {
        cron.schedule('*/5 * * * * *', async () => {
            await Project.checkProjectsDeadlinesPassed();
        }, {
            scheduled: true
        });
    }

    static async checkProjectsDeadlinesPassed() {
        let currentDate = new Date(), allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            if (project.deadline < currentDate.getTime() && project.getIsActive()) {
                await Project.getAuctionWinner(project.getId());
            }
        }
    }

    static async getAllProjects() {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        return await PostgresDataAccess.getAllProjects();
    }

    static async getProjectWithProjectId(id) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        return await PostgresDataAccess.getProjectWithId(id);
    }

    static async isThereAnyProjectsWithId(id) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        let project = await PostgresDataAccess.getProjectWithId(id);
        return project !== undefined;
    }

    static async getProjectWithProjectIdWithActive(id, isActive) {
        let project;
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        project = await PostgresDataAccess.getProjectWithId(id);
        if (project === undefined) {
            return undefined;
        } else if (project.isActive !== isActive) {
            return undefined;
        }
        return project;
    }

    static async isThereAnyProjectsWithIdWithActive(id, isActive) {
        let project = Project.getProjectWithProjectIdWithActive(id, isActive);
        return project !== undefined;
    }

    static async addProjectToDatabase(project) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        return await PostgresDataAccess.addProject(project.id, project.title, project.skills, project.budget, project.ownerId,
            project.bidOffers, project.description, project.deadline, project.winnerId, project.imageURL, project.isActive);
    }

    async addBidOffers(bidOffer) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        await PostgresDataAccess.addProjectBidOffer(this.id, bidOffer);
        this.bidOffers.push(bidOffer);
    }

    async setWinnerId(winnerId) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        await PostgresDataAccess.setProjectWinnerId(this.id, winnerId);
        this.winnerId = winnerId;
    }

    async setIsActive(isActive) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        await PostgresDataAccess.setProjectIsActive(this.id, isActive);
        this.isActive = isActive;
    }

    getIsActive() {
        return this.isActive;
    }

    getId() {
        return this.id;
    }

    getOwnerId() {
        return this.ownerId;
    }

    getBidOffers() {
        return this.bidOffers;
    }

    getSkills() {
        return this.skills;
    }

    isThisUserIdSubmittedABid(id) {
        let flag = this.bidOffers.find(bidOffer => {
            return bidOffer.biddingUser === id;
        });
        return flag !== undefined;
    }

    getBudget() {
        return this.budget;
    }

    getProjectSummary() {
        let summary = "id: " + this.id + "\ntitle: " + this.title + "\nbudget: " + this.budget + "\nskill: " + "\nrequired skills: [\n";
        this.skills.forEach(skill => {
            summary = summary.concat("name: " + skill.skillName + " ,points: " + skill.points + "\n");
        });
        summary = summary.concat("]\n");
        summary += "description: " + this.description + "\ndeadline: " + new Date(this.deadline) + "\n";
        summary = summary.concat("isActive:" + this.isActive + "\n");

        return summary;
    }

    static async getUserInstance() {
        return await require('./User');
    }

    static async getDatabaseAccessInstance() {
        let PostgresDataAccess
        PostgresDataAccess = await require('/home/tapsi/Tapsi/project1_joboonja/final/DataAccess/DatabaseDataAccess');
        return PostgresDataAccess;
    }

}

module.exports = Project;