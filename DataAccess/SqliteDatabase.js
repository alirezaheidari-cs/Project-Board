const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');


let usersDb, projectsDb
let db;

class SqliteDatabase {
    static sqliteDatabase;

    constructor() {
        usersDb = undefined;
        projectsDb = undefined;
    }

    async runDatabase(dbPath) {
        usersDb = await sqlite.open({
            filename: dbPath + 'users.db',
            driver: sqlite3.Database
        });
        projectsDb = await sqlite.open({
            filename: dbPath + 'projects.db',
            driver: sqlite3.Database
        });
        try {
            await usersDb.exec('CREATE TABLE usersTable (id, firstName, lastName, jobTitle,  bio, profilePictureURL)');
            await usersDb.exec('CREATE TABLE usersSkillsTable (userId, skillName, points)');
            await usersDb.exec('CREATE TABLE usersActiveProjectIdsTable (userId, projectId)');
            await usersDb.exec('CREATE TABLE usersInactiveProjectsIdsTable (userId, projectId)');
            await usersDb.exec('CREATE TABLE usersTakenProjectsIdsTable (userId, projectId)');
            await usersDb.exec('CREATE TABLE usersEndorsedOtherUsersSkillsListTable (userId, endorsedUserid, skillName)');

            await projectsDb.exec('CREATE TABLE projectsTable (id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive)');
            await projectsDb.exec('CREATE TABLE projectsSkillsTable (projectId, skillName , points)');
            await projectsDb.exec('CREATE TABLE projectsBidOffersTable (projectId, biddingUser , bidAmount)');
        } catch (e) {

        }
        console.log(await usersDb.all('SELECT * FROM usersTable'));
        console.log(await usersDb.all('SELECT * FROM usersSkillsTable'));
        console.log(await usersDb.all('SELECT * FROM usersActiveProjectIdsTable'));
        console.log(await usersDb.all('SELECT * FROM usersInactiveProjectsIdsTable'));
        console.log(await usersDb.all('SELECT * FROM usersTakenProjectsIdsTable'));
        console.log(await usersDb.all('SELECT * FROM usersEndorsedOtherUsersSkillsListTable'));

    }

    async getAllProjects() {
        let allProjectIds = await projectsDb.all('SELECT id  FROM projectsTable WHERE 1 = 1');
        let allProjectLength = 0
        for (let allProjectKey in allProjectIds) {
            allProjectLength += 1;
        }
        let allProjects = [];
        for (let i = 0; i < allProjectLength; i++) {
            let id = allProjectLength[i].id;
            allProjects.push(await SqliteDatabase.sqliteDatabase.getProjectWithId(id));
        }
        return allProjects;
    }

    async getProjectWithId(id) {
        let projectInformation = await projectsDb.get('SELECT *  FROM projectsTable WHERE id = ?', id);
        let projectBidOffers = await projectsDb.all('SELECT projectId, biddingUser , bidAmount  FROM projectsBidOffersTable WHERE projectId = ?', id);
        let projectsSkills = await projectsDb.all('SELECT skillName , points  FROM usersActiveProjectIdsTable WHERE userId = ?', id);
        let project = undefined;
        try {
            project = new Project(projectInformation.id, projectInformation.title, projectsSkills, projectInformation.budget
                , projectInformation.ownerId, projectBidOffers, projectInformation.description, projectInformation.deadline
                , projectInformation.winnerId, projectInformation.imageURL, projectInformation.isActive);
        } catch (e) {

        }

        return project;
    }

    async getProjectWithIdWithActive(id, isActive) {
        let project = await this.getProjectWithId(id);
        if (project.isActive !== isActive)
            return undefined;
        return project;
    }

    async getAllUsers() {
        let allUsersIds = await usersDb.all('SELECT id  FROM usersTable WHERE 1 = 1');
        let allUsersLength = 0
        for (let allUserIdsKey in allUsersIds) {
            allUsersLength += 1;
        }
        let allUsers = [];
        for (let i = 0; i < allUsersLength; i++) {
            let id = allUsersIds[i].id;
            allUsers.push(await SqliteDatabase.sqliteDatabase.getUserWithId(id));
        }
        return allUsers;
    }

    async getUserWithId(id) {
        let userInformation = await usersDb.get('SELECT *  FROM usersTable WHERE id = ?', id);
        let userSkills = await usersDb.all('SELECT skillName , points  FROM usersSkillsTable WHERE userId = ?', id);
        let userActiveProjects = await usersDb.all('SELECT projectId  FROM usersActiveProjectIdsTable WHERE userId = ?', id);
        let userInactiveProjects = await usersDb.all('SELECT projectId  FROM usersInactiveProjectsIdsTable WHERE userId = ?', id);
        let userTakenProjects = await usersDb.all('SELECT projectId  FROM usersTakenProjectsIdsTable WHERE userId = ?', id);
        let userEndorsedOtherUserSkillsList = await usersDb.all('SELECT  endorsedUserid , skillName FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
        let user = new User();
        try {
            user.setUserInformation(userInformation.id, userInformation.firstName, userInformation.lastName,
                userInformation.jobTitle, userSkills, userActiveProjects, userInactiveProjects, userTakenProjects, userInformation.bio, userInformation.profilePictureURL, userEndorsedOtherUserSkillsList);
            console.log(user);
        } catch (e) {
            user = undefined;
        }
        return user;
    }

    async addProjectToTakenProjectsIds(id, projectId) {
        await usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES (? , ?)', id, projectId);
    }

    async addProjectToActiveProjectsIds(id, projectId) {
        await usersDb.run('INSERT INTO usersActiveProjectIdsTable VALUES (? , ?)', id, projectId);
    }

    async addProjectToInactiveProjectsIds(id, projectId) {
        await usersDb.run('INSERT INTO usersInactiveProjectIdsTable VALUES (? , ?)', id, projectId);
    }

    async removeProjectIdFromActiveProjectsIds(id, projectId) {
        await usersDb.run('DELETE FROM usersActiveProjectIdsTable WHERE userid = ? and projectId = ?', id, projectId);
    }

    async addUserEndorsedOtherUsersSkillsList(id, endorsedObject) {
        await usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES (? , ? , ?)', id, endorsedObject.id, endorsedObject.skillName);
    }

    async addUserSkill(id, skill) {
        await usersDb.run('INSERT INTO usersSkillsTable VALUES (? , ? , ?)', id, skill.skillName, skill.points);
    }

    async setUserSkills(id, skills) {
        await usersDb.run('DELETE FROM usersSkillsTable WHERE userId = ?', id);
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await usersDb.run('INSERT INTO usersSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }
    }

    async setUserActiveProjects(id, activeProjectIds) {
        await usersDb.run('DELETE FROM usersActiveProjectIdsTable WHERE userId = ?', id);

        for (let i = 0; i < activeProjectIds.length; i++) {
            let activeProjectId = activeProjectIds[i];
            await usersDb.run('INSERT INTO usersActiveProjectIdsTable VALUES  (?,?)', id, activeProjectId);
        }
    }

    async setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList) {
        await usersDb.run('DELETE FROM usersEndorsedOtherUsersSkillsList WHERE userId = ?', id);
        for (let i = 0; i < endorsedOtherUsersSkillsList.length; i++) {
            let endorsedInformation = endorsedOtherUsersSkillsList[i];
            await usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsList VALUES  (?,?,?)', [id, endorsedInformation.id, endorsedInformation.skillName]);
        }
    }

    async setUserInactiveProjects(id, inactiveProjectIds) {
        await usersDb.run('DELETE FROM usersInactiveProjectsIdsTable WHERE userId = ?', id);

        for (let i = 0; i < inactiveProjectIds.length; i++) {
            let inactiveProjectId = inactiveProjectIds[i];
            await usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES  (?,?)', id, inactiveProjectId);
        }
    }

    async setUserTakenProjects(id, takenProjectsIds) {
        await usersDb.run('DELETE FROM usersTakenProjectsIdsTable WHERE userId = ?', id);

        for (let i = 0; i < takenProjectsIds.length; i++) {
            let takenProjectId = takenProjectsIds[i];
            await usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES  (?,?)', [id, takenProjectId]);
        }
    }

    async increaseSkillPoints(id, skillName) {
        let currentPoint = await usersDb.get('SELECT points FROM usersSkillsTable WHERE userId = ? and skillName = ?', id, skillName);
        let points = currentPoint.points + 1;
        let result = await usersDb.run('UPDATE usersSkillsTable SET points = ? WHERE userId = ? and skillName = ?', points, id, skillName);
    }

    async addUser(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
        await usersDb.run('INSERT INTO usersTable VALUES  (?,?,?,?,?,?)', id, firstName, lastName, jobTitle, bio, profilePictureURL);

        await SqliteDatabase.sqliteDatabase.setUserSkills(id, skills);

        await SqliteDatabase.sqliteDatabase.setUserActiveProjects(id, activeProjectIds);

        await SqliteDatabase.sqliteDatabase.setUserInactiveProjects(id, inactiveProjectsIds);

        await SqliteDatabase.sqliteDatabase.setUserTakenProjects(id, takenProjectsIds);

        await SqliteDatabase.sqliteDatabase.setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList);

    }

    async setProjectSkills(id, skills) {
        projectsDb.run('DELETE FROM projectsSkillsTable WHERE projectId = ?', id);
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await projectsDb.run('INSERT INTO projectsSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }

    }

    async setProjectBidOffers(id, bidOffers) {
        projectsDb.run('DELETE FROM projectsBidOffersTable WHERE projectId = ?', id);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            await projectsDb.run('INSERT INTO projectsBidOffersTable VALUES  (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
        }
    }

    async addProjectBidOffer(id, bidOffer) {
        await projectsDb.run('INSERT INTO projectsBidOffersTable VALUES (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
    }

    async setProjectWinnerId(id, winnerId) {
        let result = await projectsDb.run('UPDATE projectsTable SET winnerId = ? WHERE id = ?', winnerId, id);
    }

    async setProjectIsActive(id, isActive) {
        let result = await projectsDb.run('UPDATE projectsTable SET isActive = ? WHERE id = ?', isActive, id);
    }

    async addProject(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        await projectsDb.run('INSERT INTO projectTable VALUES (?,?,?,?,?,?,?,?,?)', id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive);

        await SqliteDatabase.sqliteDatabase.setProjectSkills(id, skills);

        await SqliteDatabase.sqliteDatabase.setProjectBidOffers(id, bidOffers);

    }
}

// //
// (async () => {
//     let sq = new SqliteDatabase();
//     SqliteDatabase.sqliteDatabase = sq;
//     await sq.runDatabase('./DB/');
//
//     // console.log("**********************************")
//     // await .usersDb.run('INSERT INTO usersTable VALUES  (?,?,?,?,?,?)', "a" , "b" , "c" , "d" , "e" , "f");
//     // let res=  await sq.getUserWithId('user32');
//     // await .usersDb.run('DELETE FROM usersTable WHERE 1 = 1');
//     // console.log(await .usersDb.all('SELECT * FROM usersTable'));
//     await sq.increaseSkillPoints('user1', 'HTML');
//     console.log(await usersDb.all('SELECT * FROM usersSkillsTable'))
//
// })()

module.exports = SqliteDatabase;

