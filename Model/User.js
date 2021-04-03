const Project = require('./Project.js');
const ServerDataAccess = require('../DataAccess/ServerDataAccess.js');
const AuthenticationDataAccess = require('../DataAccess/AuthenticationDataAccess.js');
const Skill = require('./Skill');
const BidOffer = require('./BidOffer');
const Endorsement = require('./Endorsement');

class User {

    static skillsSet;

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

    static async setupApplication() {
        await User.getSkillsFromServer();
        Project.schedulerForCheckProjectsDeadline();
        console.log("skills are ready");
        let PostgresDataAccess = await User.getDatabaseAccessInstance();
        let allU = await PostgresDataAccess.getAllUsers();
        let allP = await PostgresDataAccess.getAllProjects();
        console.log(JSON.stringify(allU));
        console.log(JSON.stringify(allP));
    }

    static async endorseSkill(endorseAUserSkillJSON) {
        let endorsedUser, tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(endorseAUserSkillJSON.token);
        endorsedUser = await User.getUserWithId(endorseAUserSkillJSON.endorsedUserId);
        if (endorsedUser === undefined) {
            throw "there is not any users with this id";
        } else if (endorseAUserSkillJSON.endorsedUserId === tokenOwnerUser.getId()) {
            throw "you can not endorse your own skill";
        }

        if (!(await endorsedUser.isThisUserHasThisSkill(endorseAUserSkillJSON.skillName))) {
            throw "user don't have this skill";
        } else if (await tokenOwnerUser.isThisUserEndorsedThisSkillForThisUser(endorseAUserSkillJSON.skillName, endorsedUser.getId())) {
            throw "you can not endorse this skill for this user more than once";
        }
        let endorsement = new Endorsement(endorsedUser.getId(), tokenOwnerUser.getId(), endorseAUserSkillJSON.skillName);
        await tokenOwnerUser.addToEndorsedOtherUsersSkillsList(endorsement);
        await endorsedUser.increaseSkillPoints(endorseAUserSkillJSON.skillName);
        return endorsement;
    }

    static async getAllUsersInformation() {
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

    static async showUserProfile(showProfileJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(showProfileJSON.token);
        return "----------------------\n" + await tokenOwnerUser.getUserSummary() + "----------------------\n";
    }

    static async checkUserBidNeedThisSkill(tokenOwnerUser, skillName) {
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
                return true;
            }
        }
        return false;
    }

    static async setNewSkillsAfterRemovingASkill(tokenOwnerUser, skillName) {
        await tokenOwnerUser.removeSkill(skillName);
    }

    static async setNewEndorseListAfterRemoveASkill(tokenOwnerUser, skillName) {
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

    static async removeSkill(skillJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(skillJSON.token);
        if (!(await tokenOwnerUser.isThisUserHasThisSkill(skillJSON.skillName)))
            throw "you don't have this skill";
        if (await User.checkUserBidNeedThisSkill(tokenOwnerUser, skillJSON.skillName))
            throw "you cannot remove this skill because you bid for some project which needed this skill";

        await User.setNewSkillsAfterRemovingASkill(tokenOwnerUser, skillJSON.skillName);
        await User.setNewEndorseListAfterRemoveASkill(tokenOwnerUser, skillJSON.skillName);
        return tokenOwnerUser;
    }

    static async getAllAvailableProjectsInformationForUser(seeAllAvailableProjectsInformationJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(seeAllAvailableProjectsInformationJSON.token);
        let allProjectsSummary = "----------------------\n", allProjects;
        allProjects = await Project.getAllProjects();
        for (let i = 0; i < allProjects.length; i++) {
            let project = allProjects[i];
            let condition = await User.userHasRequiredSkillsForProject(project.getSkills());
            if (condition && tokenOwnerUser.getId() !== project.getOwnerId() && project.getIsActive()) {
                allProjectsSummary += project.getProjectSummary();
                allProjectsSummary += "----------------------\n";
            }
        }
        return allProjectsSummary;
    }

    static async getSpecificUserInformation(userIdJSON) {
        let user;
        user = await User.getUserWithId(userIdJSON.id);
        if (user === undefined)
            throw "there is not any users with this id";
        return "----------------------\n" + await user.getUserSummary() + "----------------------\n";
    }

    static isThisSkillInSkillsSet(skill) {
        let flag = User.skillsSet.find(skillInSkillsSet => {
            return skillInSkillsSet.skillName === skill.skillName;
        });
        return flag !== undefined;

    }

    static async addSkill(skillJSON) {
        let tokenOwnerUser;
        tokenOwnerUser = await User.getUserWithToken(skillJSON.token);
        if (!User.isThisSkillInSkillsSet(skillJSON)) {
            throw "there is not any skills in skills set with this name";
        }
        else if (await tokenOwnerUser.isThisUserHasThisSkill(skillJSON.skillName)) {
            throw "you already have this skill";
        }
        let skill = new Skill(skillJSON.skillName, parseInt(skillJSON.points));
        await tokenOwnerUser.addSkill(skill);
        return skill;
    }

    static async registerUser(userInformationJSON) {
        let user;
        try {
            user = new User(userInformationJSON.id, userInformationJSON.firstName, userInformationJSON.lastName, userInformationJSON.jobTitle,
                undefined, [], [], [], [], userInformationJSON.bio, userInformationJSON.profilePictureURL, []);

        } catch (e) {
            throw "wrong format in json";
        }
        let response = await User.addUser(user);
        if (response === undefined)
            throw "there is a user with this id";

        await AuthenticationDataAccess.sendRegisterInformationToServer(user.id, userInformationJSON.password);
        return user;
    }

    static async loginUser(userInformationJSON) {  // id , password ,
        let user;
        user = await User.getUserWithId(userInformationJSON.id);
        if (user === undefined) {
            throw "there is not any users with this id";
        }
        let responseFromServer = await AuthenticationDataAccess.sendLoginInformationToServer(userInformationJSON.id, userInformationJSON.password);
        if (responseFromServer.message === "password is wrong") {
            throw "password is wrong";
        } else if (responseFromServer.message === "no users with this id") {
            throw "no users with this id";
        }
        return responseFromServer.token;
    }

    // ****************************************8

    static async userHasRequiredSkillsForProject(tokenOwnerId, requiredSkills) {
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

    static async getSkillsFromServer() {
        const serverDataAccess = new ServerDataAccess(8080);
        User.skillsSet = await serverDataAccess.getSkillsFromServer();
    }

    static async isTokenExpired(token) {
        return await AuthenticationDataAccess.isTokenExpired(token);
    }

    static async getUserWithToken(token) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        let id = await AuthenticationDataAccess.getUserIdWithToken(token);
        return await PostgresDataAccess.getUserWithId(id);
    }

    static async getAllUsers() {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        return await PostgresDataAccess.getAllUsers();
    }

    static async isThereAnyUserWithId(id) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        let user = await PostgresDataAccess.getUserWithId(id);
        return user !== undefined;

    }

    static async addUser(user) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        return await PostgresDataAccess.addUser(user.id, user.firstName, user.lastName, user.jobTitle, user.skills, user.activeProjectsIds,
            user.inactiveProjectsIds, user.takenProjectsIds, user.bio,
            user.profilePictureURL, user.endorsedOtherUsersSkillsList);
    }

    static async getUserWithId(id) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        return await PostgresDataAccess.getUserWithId(id);
    }

    async getEndorsedOtherUsersSkillsList() {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        return await PostgresDataAccess.getEndorsedOtherUsersSkillsList(this.id);
    }

    async setEndorsedOtherUsersSkillsList(endorsedOtherUsersSkillsList) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.setUserEndorsedOtherUsersSkillsList(this.id, endorsedOtherUsersSkillsList);
    }

    async addProjectToTakenProjectsIds(projectId) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.addProjectToTakenProjectsIds(this.id, projectId);
    }

    async addProjectToActiveProjectsIds(projectId) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.addProjectToActiveProjectsIds(this.id, projectId);
    }

    async addProjectToInactiveProjectsIds(projectId) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.addProjectToInactiveProjectsIds(this.id, projectId);
    }

    async removeProject(projectId) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.addProjectToInactiveProjectsIds(this.id, projectId);
        await PostgresDataAccess.removeProjectIdFromActiveProjectsIds(this.id, projectId);
    }

    async removeSkill(skillName) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.removeUserSkill(this.id, skillName);
    }

    async getSkills() {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        return await PostgresDataAccess.getUserSkills(this.id);
    }

    async addToEndorsedOtherUsersSkillsList(endorsedObject) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
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
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        await PostgresDataAccess.addUserSkill(this.id, skill);
    }

    async increaseSkillPoints(skillName) {
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
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
        const PostgresDataAccess = await User.getDatabaseAccessInstance();
        userGeneralInformation = await PostgresDataAccess.getUserGeneralInformation(this.id);
        let summary = "id: " + userGeneralInformation.id + "\nfirst name: " + userGeneralInformation.firstName + "\nlast name: " + userGeneralInformation.lastName + "\njob title: " + userGeneralInformation.jobTitle + "\nskills: \n[\n";
        skills.forEach(skill => {
            summary = summary.concat("skillName: " + skill.skillName + " ,points: " + skill.points + "\n");
        });
        summary = summary.concat("]\n");
        summary = summary.concat("bio: " + userGeneralInformation.bio + "\n");
        return summary;
    }

    static async getDatabaseAccessInstance() {
        let PostgresDataAccess
        PostgresDataAccess = await require('/home/tapsi/Tapsi/project1_joboonja/final/DataAccess/DatabaseDataAccess');
        return PostgresDataAccess;
    }

    getId() {
        return this.id;
    }
}

module.exports = User;