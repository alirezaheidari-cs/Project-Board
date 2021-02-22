const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');


class SqliteDatabase {
    static usersDb;
    static projectsDb;

    //***********************run database**********************//

    static async createUsersTables() {
        try {
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersTable (id, firstName, lastName, jobTitle,  bio, profilePictureURL)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersSkillsTable (userId, skillName, points)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersActiveProjectsIdsTable (userId, projectId)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersInactiveProjectsIdsTable (userId, projectId)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersTakenProjectsIdsTable (userId, projectId)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersEndorsedOtherUsersSkillsListTable (userId, endorsedUserId, skillName)');
        } catch (e) {

        }
    }

    static async createProjectsTables() {
        try {
            await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsTable (id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive)');
            await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsSkillsTable (projectId, skillName , points)');
            await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsBidOffersTable (projectId, biddingUser , bidAmount)');
        } catch (e) {

        }
    }

    static async runDatabase(dbPath) {
        SqliteDatabase.usersDb = await sqlite.open({
            filename: dbPath + 'users.db',
            driver: sqlite3.Database
        });
        SqliteDatabase.projectsDb = await sqlite.open({
            filename: dbPath + 'projects.db',
            driver: sqlite3.Database
        });
        await SqliteDatabase.createUsersTables();
        await SqliteDatabase.createProjectsTables();
        await SqliteDatabase.showDatabase();
    }

    static async showDatabase() {
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersTable'));
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersSkillsTable'));
        console.log("users active projects");
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersActiveProjectsIdsTable'));
        console.log("users inactive projects");
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersInactiveProjectsIdsTable'));
        console.log("users taken projects");
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersTakenProjectsIdsTable'));
        console.log("users endorsed list");
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersEndorsedOtherUsersSkillsListTable'));
        console.log("****************************************")
        console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsTable'));
        console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsSkillsTable'));
        console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsBidOffersTable'));

    }

    //***********************get/set user(s) and project(s)**********************//

    static async getAllProjects() {
        let allProjectIds;
        allProjectIds = await SqliteDatabase.projectsDb.all('SELECT id FROM projectsTable WHERE 1 = 1');
        let allProjects = [];
        for (let i = 0; i < allProjectIds.length; i++) {
            let projectId = allProjectIds[i].id;
            let project = await SqliteDatabase.getProjectWithId(projectId)
            allProjects.push(project);
        }
        return allProjects;
    }

    static async getProjectWithId(id) {
        let projectInformation = await SqliteDatabase.projectsDb.get('SELECT * FROM projectsTable WHERE id = ?', id);
        let projectBidOffers = await SqliteDatabase.projectsDb.all('SELECT biddingUser, projectId , bidAmount  FROM projectsBidOffersTable WHERE projectId = ?', id);
        let projectsSkills = await SqliteDatabase.projectsDb.all('SELECT skillName , points  FROM projectsSkillsTable WHERE projectId = ?', id);
        let project = undefined;
        try {
            let isActive = projectInformation.isActive ? true : false;
            project = new Project(projectInformation.id, projectInformation.title, projectsSkills, projectInformation.budget
                , projectInformation.ownerId, projectBidOffers, projectInformation.description, projectInformation.deadline
                , projectInformation.winnerId, projectInformation.imageURL, isActive);
        } catch (e) {

        }
        return project;
    }

    static async getAllUsers() {
        let allUsersIds;
        allUsersIds = await SqliteDatabase.usersDb.all('SELECT id  FROM usersTable WHERE 1 = 1');
        let allUsers = [];
        for (let i = 0; i < allUsersIds.length; i++) {
            let userId = allUsersIds[i].id;
            let user = await SqliteDatabase.getUserWithId(userId);
            allUsers.push(user);
        }
        return allUsers;
    }

    static async getUserWithId(id) {
        let userInformation = await SqliteDatabase.usersDb.get('SELECT *  FROM usersTable WHERE id = ?', id);
        let userSkills = await SqliteDatabase.usersDb.all('SELECT skillName , points  FROM usersSkillsTable WHERE userId = ?', id);
        let userActiveProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersActiveProjectsIdsTable WHERE userId = ?', id);
        let userInactiveProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersInactiveProjectsIdsTable WHERE userId = ?', id);
        let userTakenProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersTakenProjectsIdsTable WHERE userId = ?', id);
        let userEndorsedOtherUserSkillsList = await SqliteDatabase.usersDb.all('SELECT  endorsedUserId , skillName FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
        let user;
        try {
            user = new User(userInformation.id, userInformation.firstName, userInformation.lastName,
                userInformation.jobTitle, userSkills, userActiveProjects, userInactiveProjects, userTakenProjects, userInformation.bio, userInformation.profilePictureURL, userEndorsedOtherUserSkillsList);
        } catch (e) {
            user = undefined;
        }
        return user;
    }

    static async addUser(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {

        await SqliteDatabase.usersDb.run('INSERT INTO usersTable VALUES  (?,?,?,?,?,?)', id, firstName, lastName, jobTitle, bio, profilePictureURL);

        await SqliteDatabase.setUserSkills(id, skills);

        await SqliteDatabase.setUserActiveProjects(id, activeProjectIds);

        await SqliteDatabase.setUserInactiveProjects(id, inactiveProjectsIds);

        await SqliteDatabase.setUserTakenProjects(id, takenProjectsIds);

        await SqliteDatabase.setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList);

    }

    static async addProject(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        await SqliteDatabase.projectsDb.run('INSERT INTO projectsTable VALUES (?,?,?,?,?,?,?,?,?)', id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive);

        await SqliteDatabase.setProjectSkills(id, skills);

        await SqliteDatabase.setProjectBidOffers(id, bidOffers);
    }

    //***********************user insert/update/delete/get **********************//

    static async getUserGeneralInformation(id) {
        return await SqliteDatabase.usersDb.get('SELECT * FROM usersTable WHERE id = ?', id);
    }

    static async addProjectToTakenProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES (?,?)', id, projectId);
    }

    static async addProjectToActiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersActiveProjectsIdsTable VALUES (? , ?)', id, projectId);
    }

    static async addProjectToInactiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES (?,?)', id, projectId);
    }

    static async addUserEndorsedOtherUsersSkillsList(id, endorsedObject) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES (?,?,?)', id, endorsedObject.endorsedUserId, endorsedObject.skillName);
    }

    static async removeProjectIdFromActiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersActiveProjectsIdsTable WHERE userId = ? and projectId = ?', id, projectId);
    }

    static async addUserSkill(id, skill) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersSkillsTable VALUES (?,?,?)', id, skill.skillName, skill.points);
    }

    static async removeUserSkill(id, skillName) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersSkillsTable WHERE userId = ? and skillName = ?', id, skillName);
    }

    static async setUserSkills(id, skills) {
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }
    }

    static async getEndorsedOtherUsersSkillsList(id) {
        return await SqliteDatabase.usersDb.all('SELECT endorsedUserId , skillName  FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
    }

    static async getUserSkills(id) {
        return await SqliteDatabase.usersDb.all('SELECT skillName , points FROM usersSkillsTable WHERE userId = ?', id);
    }

    static async setUserActiveProjects(id, activeProjectsIds) {
        for (let i = 0; i < activeProjectsIds.length; i++) {
            let activeProject = activeProjectsIds[i]
            await SqliteDatabase.usersDb.run('INSERT INTO usersActiveProjectsIdsTable VALUES  (?,?)', [id, activeProject]);
        }
    }

    static async setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList) {
        let currentEndorsedList;
        currentEndorsedList = await SqliteDatabase.usersDb.all('SELECT endorsedUserId, skillName FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);

        for (let i = 0; i < currentEndorsedList.length; i++) {
            let currentEndorse = currentEndorsedList[i];
            if (!endorsedOtherUsersSkillsList.includes(currentEndorse)) {
                await SqliteDatabase.usersDb.run('DELETE FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ? and endorsedUserId = ? and skillName = ?', id, currentEndorse.endorsedUserId, currentEndorse.skillName);
            }
        }

        for (let i = 0; i < endorsedOtherUsersSkillsList.length; i++) {
            let newEndorse = endorsedOtherUsersSkillsList[i];
            if (!currentEndorsedList.includes(newEndorse)) {
                await SqliteDatabase.usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES  (?,?,?)', [id, newEndorse.endorsedUserId, newEndorse.skillName]);
            }
        }
    }

    static async setUserInactiveProjects(id, inactiveProjectIds) {
        for (let i = 0; i < inactiveProjectIds.length; i++) {
            let inactiveProjectId = inactiveProjectIds[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES  (?,?)', id, inactiveProjectId);
        }
    }

    static async setUserTakenProjects(id, takenProjectsIds) {
        for (let i = 0; i < takenProjectsIds.length; i++) {
            let takenProjectId = takenProjectsIds[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES  (?,?)', [id, takenProjectId]);
        }
    }

    static async increaseSkillPoints(id, endorsedUserId, skillName) {
        let currentPoint = await SqliteDatabase.usersDb.get('SELECT points FROM usersSkillsTable WHERE userId = ? and skillName = ?', id, skillName);
        let points = currentPoint.points + 1;
        await SqliteDatabase.usersDb.run('UPDATE usersSkillsTable SET points = ? WHERE userId = ? and skillName = ?', points, id, skillName);
    }

    //***********************project insert/update/delete/get **********************//

    static async setProjectSkills(id, skills) {
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await SqliteDatabase.projectsDb.run('INSERT INTO projectsSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }
    }

    static async setProjectBidOffers(id, bidOffers) {
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            await SqliteDatabase.projectsDb.run('INSERT INTO projectsBidOffersTable VALUES (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
        }
    }

    static async addProjectBidOffer(id, bidOffer) {
        await SqliteDatabase.projectsDb.run('INSERT INTO projectsBidOffersTable VALUES (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
    }

    static async setProjectWinnerId(id, winnerId) {
        await SqliteDatabase.projectsDb.run('UPDATE projectsTable SET winnerId = ? WHERE id = ?', winnerId, id);
    }

    static async setProjectIsActive(id, isActive) {
        await SqliteDatabase.projectsDb.run('UPDATE projectsTable SET isActive = ? WHERE id = ?', isActive, id);
    }

}

module.exports = SqliteDatabase;

