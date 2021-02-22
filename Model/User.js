// const SqliteDatabase = require('../DataAccess/SqliteDatabase');
let SqliteDatabase;

class User {
    static connectToDatabase(sqliteDatabase) {
        SqliteDatabase = sqliteDatabase;
    }

    constructor(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
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
    }

    static async getAllUsers() {
        return await SqliteDatabase.getAllUsers();
    }

    static async isThereAnyUserWithId(id) {
        let user = await SqliteDatabase.getUserWithId(id);
        return user !== undefined;

    }

    static async addUser(user) {
        await SqliteDatabase.addUser(user.id, user.firstName, user.lastName, user.jobTitle, user.skills, user.activeProjectsIds,
            user.inactiveProjectsIds, user.takenProjectsIds, user.bio,
            user.profilePictureURL, user.endorsedOtherUsersSkillsList);
    }

    static async getUserWithId(id) {
        return await SqliteDatabase.getUserWithId(id);
    }

    async getEndorsedOtherUsersSkillsList() {
        return await SqliteDatabase.getEndorsedOtherUsersSkillsList(this.id);
    }

    async setEndorsedOtherUsersSkillsList(endorsedOtherUsersSkillsList) {
        await SqliteDatabase.setUserEndorsedOtherUsersSkillsList(this.id, endorsedOtherUsersSkillsList);
    }

    getId() {
        return this.id;
    }

    async addProjectToTakenProjectsIds(projectId) {
        await SqliteDatabase.addProjectToTakenProjectsIds(this.id, projectId);
    }

    async addProjectToActiveProjectsIds(projectId) {
        await SqliteDatabase.addProjectToActiveProjectsIds(this.id, projectId);
    }

    async addProjectToInactiveProjectsIds(projectId) {
        await SqliteDatabase.addProjectToInactiveProjectsIds(this.id, projectId);
    }

    async removeProject(projectId) {
        await SqliteDatabase.addProjectToInactiveProjectsIds(this.id, projectId);
        await SqliteDatabase.removeProjectIdFromActiveProjectsIds(this.id, projectId);
    }

    async removeSkill(skillName) {
        await SqliteDatabase.removeUserSkill(this.id, skillName);
    }

    async getSkills() {
        return await SqliteDatabase.getUserSkills(this.id);
    }

    async addToEndorsedOtherUsersSkillsList(endorsedObject) {
        await SqliteDatabase.addUserEndorsedOtherUsersSkillsList(this.id, endorsedObject);
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
        await SqliteDatabase.addUserSkill(this.id, skill);
    }

    async increaseSkillPoints(endorsedUserId, skillName) {
        let skills;
        skills = await this.getSkills();
        skills.forEach(skill => {
            if (skill.skillName === skillName) {
                skill.points = skill.points + 1;
            }
        });
        await SqliteDatabase.increaseSkillPoints(this.id, endorsedUserId, skillName);
    }

    async getUserSummary() {
        let skills, userGeneralInformation;
        skills = await this.getSkills();
        userGeneralInformation = await SqliteDatabase.getUserGeneralInformation(this.id);
        let summary = "id: " + userGeneralInformation.id + "\nfirst name: " + userGeneralInformation.firstName + "\nlast name: " + userGeneralInformation.lastName + "\njob title: " + userGeneralInformation.jobTitle + "\nskills: [\n";
        skills.forEach(skill => {
            summary = summary.concat("skillName: " + skill.skillName + " ,points: " + skill.points + "\n");
        });
        summary = summary.concat("]\n");
        summary = summary.concat("bio: " + userGeneralInformation.bio + "\n");
        return summary;
    }
}

module.exports = User;