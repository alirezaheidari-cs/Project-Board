// const SqliteDatabase = require('../DataAccess/SqliteDatabase');
let SqliteDatabase;
class Project {

    static setDatabase (sqliteDatabase){
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
        let allProjects = await SqliteDatabase.getAllProjectsFromDatabase();
        return allProjects;
    }


    static async getProjectWithProjectId(id) {
        let project = await SqliteDatabase.getProjectWithIdFromDatabase(id);
        return project;
    }

    static async isThereAnyProjectsWithId(id) {
        let project = await SqliteDatabase.getProjectWithIdFromDatabase(id);
        if (project !== undefined)
            return true;
        return false;
    }

    static async getProjectWithProjectIdWithActive(id, isActive) {
        let project;
        project = await SqliteDatabase.getProjectWithIdFromDatabase(id);
        if (project === undefined) {
            return undefined;
        } else if (project.isActive != isActive) {
            return undefined;
        }
        return project;
    }

    static async isThereAnyProjectsWithIdWithActive(id, isActive) {
        let project;
        project = await SqliteDatabase.getProjectWithIdFromDatabase(id);
        if (project === undefined) {
            return false;
        } else if (project.isActive != isActive) {
            return false;
        }
        return true;
    }

    static async addProject(project) {
        await SqliteDatabase.addProjectToDatabase(project.id, project.title, project.skills, project.budget, project.ownerId,
            project.bidOffers, project.description, project.deadline, project.winnerId, project.imageURL, project.isActive);
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getImageURL() {
        return this.imageURL;
    }

    setImageURL(imageURL) {
        this.imageURL = imageURL;
    }

    getWinnerId() {
        return this.winnerId;
    }

    async setWinnerId(winnerId) {
        await SqliteDatabase.setProjectWinnerId(this.id, winnerId);
        this.winnerId = winnerId;
    }

    getDescription() {
        return this.description;
    }

    setDescription(description) {
        this.description = description;
    }

    getDeadline() {
        return this.deadline;
    }

    setDeadline(deadLine) {
        this.deadline = deadLine;
    }

    getIsActive() {
        return this.isActive;
    }

    async setIsActive(isActive) {
        await SqliteDatabase.setProjectIsActive(this.id, isActive);
        this.isActive = isActive;
    }

    getOwnerId() {
        return this.ownerId;
    }

    async addBidOffers(bidOffer) {
        await SqliteDatabase.addProjectBidOffer(this.id, bidOffer);
        this.bidOffers.push(bidOffer);
    }

    getBidOffers() {
        return this.bidOffers;
    }

    getTitle() {
        return this.title;
    }

    getSkills() {
        return this.skills;
    }

    isThisUserIdSubmittedABid(id) {
        let flag = false;
        try {
            this.bidOffers.forEach(bidOffer => {
                if (bidOffer.biddingUser === id) {
                    flag = true;
                }
            });
        } catch (e) {

        }
        return flag;
    }

    removeBidWithUserId(id) {
        this.bidOffers = this.bidOffers.filter(bidOffer => {
            if (bidOffer.biddingUser !== id) {          // biddingUser is users id
                return bidOffer;
            }
        });
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
        summary = summary.concat("bio: " + this.bio + "\n");
        summary += "description: " + this.description + "\ndeadline: " + new Date(this.deadline) + "\n";
        return summary;
    }

    setProjectInformation(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
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
}

module.exports = Project;