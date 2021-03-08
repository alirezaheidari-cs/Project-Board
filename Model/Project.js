// const SqliteDatabase = require('../DataAccess/SqliteDatabase');
let PostgresDataAccess;

class Project {

    static connectToDatabase(db) {
        PostgresDataAccess = db;
    }

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

    static async getAllProjects() {
        return await PostgresDataAccess.getAllProjects();
    }

    static async getProjectWithProjectId(id) {
        return await PostgresDataAccess.getProjectWithId(id);
    }

    static async isThereAnyProjectsWithId(id) {
        let project = await PostgresDataAccess.getProjectWithId(id);
        return project !== undefined;
    }

    static async getProjectWithProjectIdWithActive(id, isActive) {
        let project;
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

    static async addProject(project) {
        await PostgresDataAccess.addProject(project.id, project.title, project.skills, project.budget, project.ownerId,
            project.bidOffers, project.description, project.deadline, project.winnerId, project.imageURL, project.isActive);
    }

    async addBidOffers(bidOffer) {
        await PostgresDataAccess.addProjectBidOffer(this.id, bidOffer);
        this.bidOffers.push(bidOffer);
    }

    async setWinnerId(winnerId) {
        await PostgresDataAccess.setProjectWinnerId(this.id, winnerId);
        this.winnerId = winnerId;
    }

    async setIsActive(isActive) {
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

}

module.exports = Project;