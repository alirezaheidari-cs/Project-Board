
class User {
    static allUsers = [];
    static sqliteDatabase;

    constructor() {
        this.id = undefined;
        this.firstName = undefined;
        this.lastName = undefined;
        this.jobTitle = undefined;
        this.skills = undefined;
        this.activeProjectsIds = undefined;
        this.inactiveProjectsIds = undefined;
        this.takenProjectsIds = undefined;
        this.bio = undefined;
        this.profilePictureURL = undefined;
        this.endorsedOtherUsersSkillsList = undefined;
    }

    static async getAllUsers() {
        let allUsers = await User.sqliteDatabase.getAllUsers();
        return allUsers;
    }

    static async isThereAnyUserWithId(id) {
        let user = await User.sqliteDatabase.getUserWithId(id);
        if (user === undefined)
            return false;
        return true;
    }

    static async addUser(user) {
        await User.sqliteDatabase.addUser(user.id, user.firstName, user.lastName, user.jobTitle, user.skills, user.activeProjectsIds,
            user.inactiveProjectsIds, user.takenProjectsIds, user.bio,
            user.profilePictureURL, user.endorsedOtherUsersSkillsList);
    }

    static async getUserWithId(id) {
        let user = await User.sqliteDatabase.getUserWithId(id);
        if (user === undefined)
            return undefined;
        return user;
    }

    getEndorsedOtherUsersSkillsList() {
        return this.endorsedOtherUsersSkillsList;
    }

    async setEndorsedOtherUsersSkillsList(endorsedOtherUsersSkillsList) {
        this.endorsedOtherUsersSkillsList = endorsedOtherUsersSkillsList;
        await User.sqliteDatabase.setUserEndorsedOtherUsersSkillsList(this.id, endorsedOtherUsersSkillsList);
    }

    getProfilePictureURL() {
        return this.profilePictureURL;
    }

    setProfilePictureURL(profilePictureURL) {
        this.profilePictureURL = profilePictureURL;
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getFirstName() {
        return this.firstName;
    }

    setFirstName(firstName) {
        this.firstName = firstName;
    }

    getLastName() {
        return this.lastName;
    }

    setLastName(lastName) {
        this.lastName = lastName;
    }

    getJobTitle() {
        return this.jobTitle;
    }

    setJobTitle(jobTitle) {
        this.jobTitle = jobTitle;
    }

    getTakenProjectsIds() {
        return this.takenProjectsIds;
    }

    async addProjectToTakenProjectsIds(projectId) {
        if (!this.takenProjectsIds.includes(projectId))
            this.takenProjectsIds.push(projectId);
        await User.sqliteDatabase.addProjectToTakenProjectsIds(this.id, projectId);

    }

    async addProjectToActiveProjectsIds(projectId) {
        this.activeProjectsIds.push(projectId);
        await User.sqliteDatabase.addProjectToActiveProjectsIds(this.id, projectId);
    }

    async addProjectToInactiveProjectsIds(projectId) {
        this.inactiveProjectsIds.push(projectId);
        await User.sqliteDatabase.addProjectToInactiveProjectsIds(this.id, projectId);

    }

    async removeProject(projectId) {
        await this.addProjectToInactiveProjectsIds(this.id, projectId);
        await User.sqliteDatabase.removeProjectIdFromActiveProjectsIds(this.id, projectId);
        this.activeProjectsIds = this.activeProjectsIds.filter(activeProjectId => {
            if (activeProjectId !== projectId) {
                return activeProjectId;
            }
        });
    }

    getBio() {
        return this.bio;
    }

    setBio(bio) {
        this.bio = bio;
    }

    async setSkills(skills) {
        this.skills = skills;
        await User.sqliteDatabase.setUserSkills(this.id, skills);
    }

    getSkills() {
        return this.skills;
    }

    setUserInformation(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
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

    async addToEndorsedOtherUsersSkillsList(endorsedObject) {
        this.endorsedOtherUsersSkillsList.push(endorsedObject);
        await User.sqliteDatabase.addUserEndorsedOtherUsersSkillsList(this.id, endorsedObject);
    }

     isThisUserEndorsedThisSkillForThisUser(skillName, endorsedUserId) {
        let flag = false;
        try {
            this.endorsedOtherUsersSkillsList.forEach(endorsedObject => {
                if (endorsedObject.id === endorsedUserId && endorsedObject.skillName === skillName) {
                    flag = true;
                    throw "";
                }
            })
        } catch (e) {

        }
        return flag;
    }

     isThisUserHasThisSkill(skillName) {
        let flag = false;
        try {
            this.skills.forEach(skill => {
                if (skill.skillName === skillName) {
                    flag = true;
                    throw "";
                }
            })
        } catch (e) {

        }
        return flag;
    }

    async addSkill(skill) {
        this.skills.push(skill);
        await User.sqliteDatabase.addUserSkill(this.id, skill);
    }

    async increaseSkillPoints(skillName) {
        try {
            this.getSkills().forEach(skill => {
                if (skill.skillName === skillName) {
                    skill.points = skill.points + 1;
                    throw "";
                }
            });
        } catch (e) {
        }
        await User.sqliteDatabase.increaseSkillPoints(this.id, skillName);
    }

    getSummary() {
        let summary = "id: " + this.id + "\nfirst name: " + this.firstName + "\nlast name: " + this.lastName + "\njob title: " + this.jobTitle + "\nskills: [\n";
        this.skills.forEach(skill => {
            summary = summary.concat("skillName: " + skill.skillName + " ,points: " + skill.points + "\n");
        });
        summary = summary.concat("]\n");
        summary = summary.concat("bio: " + this.bio + "\n");
        return summary;
    }
}

module.exports = User;