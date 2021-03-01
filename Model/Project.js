// const SqliteDatabase = require('../DataAccess/SqliteDatabase');
let SqliteDatabase;

class Project {

    static connectToDatabase(sqliteDatabase) {
        SqliteDatabase = sqliteDatabase;
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
        return await SqliteDatabase.getAllProjects();
    }

    static async getProjectWithProjectId(id) {
        return await SqliteDatabase.getProjectWithId(id);
    }

    static async isThereAnyProjectsWithId(id) {
        let project = await SqliteDatabase.getProjectWithId(id);
        return project !== undefined;
    }

    static async getProjectWithProjectIdWithActive(id, isActive) {
        let project;
        project = await SqliteDatabase.getProjectWithId(id);
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
        await SqliteDatabase.addProject(project.id, project.title, project.skills, project.budget, project.ownerId,
            project.bidOffers, project.description, project.deadline, project.winnerId, project.imageURL, project.isActive);
    }

    async addBidOffers(bidOffer) {
        await SqliteDatabase.addProjectBidOffer(this.id, bidOffer);
        this.bidOffers.push(bidOffer);
    }

    async setWinnerId(winnerId) {
        await SqliteDatabase.setProjectWinnerId(this.id, winnerId);
        this.winnerId = winnerId;
    }

    async setIsActive(isActive) {
        await SqliteDatabase.setProjectIsActive(this.id, isActive);
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