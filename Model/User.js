// const SqliteDatabase = require('../DataAccess/SqliteDatabase');
let PostgresDataAccess;


class User {
    static connectToDatabase(db) {
        PostgresDataAccess = db;
    }

    constructor(id, firstName, lastName, jobTitle, password, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.jobTitle = jobTitle;
        this.skills = skills;
        this.activeProjectsIds = activeProjectIds;
        this.inactiveProjectsIds = inactiveProjectsIds;
        this.takenProjectsIds = takenProjectsIds;
        this.bio = bio;
        this.profilePictureURL = profilePictureURL;
        this.endorsedOtherUsersSkillsList = endorsedOtherUsersSkillsList;
        this.password = password;
    }

    static async getUserWithToken(token , authenticationDataAccess){
        let id = await authenticationDataAccess.getUserIdWithToken(token);
        return await PostgresDataAccess.getUserWithId(id);
    }

    static async getAllUsers() {
        return await PostgresDataAccess.getAllUsers();
    }

    static async isThereAnyUserWithId(id) {
        let user = await PostgresDataAccess.getUserWithId(id);
        return user !== undefined;

    }

    static async addUser(user) {
        await PostgresDataAccess.addUser(user.id, user.firstName, user.lastName, user.jobTitle, user.skills, user.activeProjectsIds,
            user.inactiveProjectsIds, user.takenProjectsIds, user.bio,
            user.profilePictureURL, user.endorsedOtherUsersSkillsList);
    }

    static async getUserWithId(id) {
        return await PostgresDataAccess.getUserWithId(id);
    }

    async getEndorsedOtherUsersSkillsList() {
        return await PostgresDataAccess.getEndorsedOtherUsersSkillsList(this.id);
    }

    async setEndorsedOtherUsersSkillsList(endorsedOtherUsersSkillsList) {
        await PostgresDataAccess.setUserEndorsedOtherUsersSkillsList(this.id, endorsedOtherUsersSkillsList);
    }

    async addProjectToTakenProjectsIds(projectId) {
        await PostgresDataAccess.addProjectToTakenProjectsIds(this.id, projectId);
    }

    async addProjectToActiveProjectsIds(projectId) {
        await PostgresDataAccess.addProjectToActiveProjectsIds(this.id, projectId);
    }

    async addProjectToInactiveProjectsIds(projectId) {
        await PostgresDataAccess.addProjectToInactiveProjectsIds(this.id, projectId);
    }

    async removeProject(projectId) {
        await PostgresDataAccess.addProjectToInactiveProjectsIds(this.id, projectId);
        await PostgresDataAccess.removeProjectIdFromActiveProjectsIds(this.id, projectId);
    }

    async removeSkill(skillName) {
        await PostgresDataAccess.removeUserSkill(this.id, skillName);
    }

    async getSkills() {
        return await PostgresDataAccess.getUserSkills(this.id);
    }

    async addToEndorsedOtherUsersSkillsList(endorsedObject) {

        await PostgresDataAccess.addUserEndorsedOtherUsersSkillsList(this.id, endorsedObject);
    }

    async isThisUserEndorsedThisSkillForThisUser(skillName, endorsedUserId) {
        let endorsedOtherUsersSkillsList;
        endorsedOtherUsersSkillsList = await this.getEndorsedOtherUsersSkillsList();
        let flag = endorsedOtherUsersSkillsList.find(endorsed => {
            return endorsed.endorsedUserId === endorsedUserId && endorsed.skillName === skillName
        })
        return flag !== undefined;
    }

    async isThisUserHasThisSkill(skillName) {
        let skills;
        skills = await this.getSkills();
        let flag = skills.find(skill => {
            return skill.skillName === skillName;
        });
        return flag !== undefined;
    }

    async addSkill(skill) {
        this.skills.push(skill);
        await PostgresDataAccess.addUserSkill(this.id, skill);
    }

    async increaseSkillPoints(skillName) {
        let skills;
        skills = await this.getSkills();
        skills.forEach(skill => {
            if (skill.skillName === skillName) {
                skill.points = skill.points + 1;
            }
        });
        await PostgresDataAccess.increaseSkillPoints(this.id, skillName);
    }

    async getUserSummary() {
        let skills, userGeneralInformation;
        skills = await this.getSkills();
        userGeneralInformation = await PostgresDataAccess.getUserGeneralInformation(this.id);
        let summary = "id: " + userGeneralInformation.id + "\nfirst name: " + userGeneralInformation.firstName + "\nlast name: " + userGeneralInformation.lastName + "\njob title: " + userGeneralInformation.jobTitle + "\nskills: \n[\n";
        skills.forEach(skill => {
            summary = summary.concat("skillName: " + skill.skillName + " ,points: " + skill.points + "\n");
        });
        summary = summary.concat("]\n");
        summary = summary.concat("bio: " + userGeneralInformation.bio + "\n");
        return summary;
    }

    getId() {
        return this.id;
    }
}

module.exports = User;