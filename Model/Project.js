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

    static async addProject(project) {
        const PostgresDataAccess = await Project.getDatabaseAccessInstance();
        await PostgresDataAccess.addProject(project.id, project.title, project.skills, project.budget, project.ownerId,
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
    static async getDatabaseAccessInstance(){
        let PostgresDataAccess
        PostgresDataAccess = await require('/home/tapsi/Tapsi/project1_joboonja/final/DataAccess/PostgresDataAccess');
        return PostgresDataAccess;
    }

}

module.exports = Project;