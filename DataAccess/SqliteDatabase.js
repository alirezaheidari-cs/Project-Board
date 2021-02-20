const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');


class SqliteDatabase {
    static usersDb;
    static projectsDb;

    static async runDatabase(dbPath) {
        SqliteDatabase.usersDb = await sqlite.open({
            filename: dbPath + 'users.db',
            driver: sqlite3.Database
        });
        SqliteDatabase.projectsDb = await sqlite.open({
            filename: dbPath + 'projects.db',
            driver: sqlite3.Database
        });
        try {
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersTable (id, firstName, lastName, jobTitle,  bio, profilePictureURL)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersSkillsTable (userId, skillName, points)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersActiveProjectsIdsTable (userId, projectId)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersInactiveProjectsIdsTable (userId, projectId)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersTakenProjectsIdsTable (userId, projectId)');
            await SqliteDatabase.usersDb.exec('CREATE TABLE usersEndorsedOtherUsersSkillsListTable (userId, endorsedUserId, skillName)');

            await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsTable (id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive)');
            await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsSkillsTable (projectId, skillName , points)');
            await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsBidOffersTable (projectId, biddingUser , bidAmount)');
        } catch (e) {

        }
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersTable'));
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersSkillsTable'));
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersActiveProjectsIdsTable'));
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersInactiveProjectsIdsTable'));
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersTakenProjectsIdsTable'));
        console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersEndorsedOtherUsersSkillsListTable'));
        console.log("****************************************")
        console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsTable'));
        console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsSkillsTable'));
        console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsBidOffersTable'));

    }

    static async getAllProjectsFromDatabase() {
        let allProjectIds = await SqliteDatabase.projectsDb.all('SELECT id FROM projectsTable WHERE 1 = 1');
        let allProjectLength = 0;
        for (let allProjectKey in allProjectIds) {
            allProjectLength += 1;
        }
        let allProjects = [];
        for (let i = 0; i < allProjectLength; i++) {
            let id = allProjectIds[i].id;
            let project;
            project = await SqliteDatabase.getProjectWithIdFromDatabase(id)
            allProjects.push(project);
        }
        return allProjects;
    }

    static async getProjectWithIdFromDatabase(id) {
        let projectInformation = await SqliteDatabase.projectsDb.get('SELECT * FROM projectsTable WHERE id = ?', id);
        let projectBidOffers = await SqliteDatabase.projectsDb.all('SELECT biddingUser, projectId , bidAmount  FROM projectsBidOffersTable WHERE projectId = ?', id);
        let projectsSkills = await SqliteDatabase.projectsDb.all('SELECT skillName , points  FROM projectsSkillsTable WHERE projectId = ?', id);
        let project = undefined;
        try {
            project = new Project(projectInformation.id, projectInformation.title, projectsSkills, projectInformation.budget
                , projectInformation.ownerId, projectBidOffers, projectInformation.description, projectInformation.deadline
                , projectInformation.winnerId, projectInformation.imageURL, projectInformation.isActive);
        } catch (e) {

        }
        return project;
    }


    static async getAllUsersFromDatabase() {
        let allUsersIds = await SqliteDatabase.usersDb.all('SELECT id  FROM usersTable WHERE 1 = 1');
        let allUsersLength = 0
        for (let allUserIdsKey in allUsersIds) {
            allUsersLength += 1;
        }
        let allUsers = [];
        for (let i = 0; i < allUsersLength; i++) {
            let id = allUsersIds[i].id;
            let user;
            user = await SqliteDatabase.getUserWithIdFromDatabase(id);
            allUsers.push(user);
        }
        return allUsers;
    }

    static async getUserWithIdFromDatabase(id) {
        let userInformation = await SqliteDatabase.usersDb.get('SELECT *  FROM usersTable WHERE id = ?', id);
        let userSkills = await SqliteDatabase.usersDb.all('SELECT skillName , points  FROM usersSkillsTable WHERE userId = ?', id);
        let userActiveProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersActiveProjectsIdsTable WHERE userId = ?', id);
        let userInactiveProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersInactiveProjectsIdsTable WHERE userId = ?', id);
        let userTakenProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersTakenProjectsIdsTable WHERE userId = ?', id);
        let userEndorsedOtherUserSkillsList = await SqliteDatabase.usersDb.all('SELECT  endorsedUserId , skillName FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
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

    static async addProjectToTakenProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES (? , ?)', id, projectId);
    }

    static async addProjectToActiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersActiveProjectsIdsTable VALUES (? , ?)', id, projectId);
    }

    static async addProjectToInactiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES (? , ?)', id, projectId);
    }

    static async removeProjectIdFromActiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersActiveProjectsIdsTable WHERE userId = ? and projectId = ?', id, projectId);
    }

    static async addUserEndorsedOtherUsersSkillsList(id, endorsedObject) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES (? , ? , ?)', id, endorsedObject.id, endorsedObject.skillName);
    }

    static async addUserSkill(id, skill) {
        await SqliteDatabase.usersDb.run('INSERT INTO usersSkillsTable VALUES (? , ? , ?)', id, skill.skillName, skill.points);
    }

    static async setUserSkills(id, skills) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersSkillsTable WHERE userId = ?', id);
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }
    }

    static async setUserActiveProjects(id, activeProjectIds) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersActiveProjectsIdsTable WHERE userId = ?', id);

        for (let i = 0; i < activeProjectIds.length; i++) {
            let activeProjectId = activeProjectIds[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersActiveProjectsIdsTable VALUES  (?,?)', id, activeProjectId);
        }
    }

    static async setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
        for (let i = 0; i < endorsedOtherUsersSkillsList.length; i++) {
            let endorsedInformation = endorsedOtherUsersSkillsList[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES  (?,?,?)', [id, endorsedInformation.id, endorsedInformation.skillName]);
        }
    }

    static async setUserInactiveProjects(id, inactiveProjectIds) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersInactiveProjectsIdsTable WHERE userId = ?', id);

        for (let i = 0; i < inactiveProjectIds.length; i++) {
            let inactiveProjectId = inactiveProjectIds[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES  (?,?)', id, inactiveProjectId);
        }
    }

    static async setUserTakenProjects(id, takenProjectsIds) {
        await SqliteDatabase.usersDb.run('DELETE FROM usersTakenProjectsIdsTable WHERE userId = ?', id);

        for (let i = 0; i < takenProjectsIds.length; i++) {
            let takenProjectId = takenProjectsIds[i];
            await SqliteDatabase.usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES  (?,?)', [id, takenProjectId]);
        }
    }

    static async increaseSkillPoints(id, skillName) {
        let currentPoint = await SqliteDatabase.usersDb.get('SELECT points FROM usersSkillsTable WHERE userId = ? and skillName = ?', id, skillName);
        let points = currentPoint.points + 1;
        let result = await SqliteDatabase.usersDb.run('UPDATE usersSkillsTable SET points = ? WHERE userId = ? and skillName = ?', points, id, skillName);
    }

    static async addUserToDatabase(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
        // await SqliteDatabase.usersDb.run('DELETE FROM usersTable WHERE id = ?' , id);

        await SqliteDatabase.usersDb.run('INSERT INTO usersTable VALUES  (?,?,?,?,?,?)', id, firstName, lastName, jobTitle, bio, profilePictureURL);

        await SqliteDatabase.setUserSkills(id, skills);

        await SqliteDatabase.setUserActiveProjects(id, activeProjectIds);

        await SqliteDatabase.setUserInactiveProjects(id, inactiveProjectsIds);

        await SqliteDatabase.setUserTakenProjects(id, takenProjectsIds);

        await SqliteDatabase.setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList);

    }

    static async setProjectSkills(id, skills) {
        await SqliteDatabase.projectsDb.run('DELETE FROM projectsSkillsTable WHERE projectId = ?', id);
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await SqliteDatabase.projectsDb.run('INSERT INTO projectsSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }

    }

    static async setProjectBidOffers(id, bidOffers) {
        await SqliteDatabase.projectsDb.run('DELETE FROM projectsBidOffersTable WHERE projectId = ?', id);
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            await SqliteDatabase.projectsDb.run('INSERT INTO projectsBidOffersTable VALUES  (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
        }
    }

    static async addProjectBidOffer(id, bidOffer) {
        await SqliteDatabase.projectsDb.run('INSERT INTO projectsBidOffersTable VALUES (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
    }

    static async setProjectWinnerId(id, winnerId) {
        let result = await SqliteDatabase.projectsDb.run('UPDATE projectsTable SET winnerId = ? WHERE id = ?', winnerId, id);
    }

    static async setProjectIsActive(id, isActive) {
        let result = await SqliteDatabase.projectsDb.run('UPDATE projectsTable SET isActive = ? WHERE id = ?', isActive, id);
    }

    static async addProjectToDatabase(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        await SqliteDatabase.projectsDb.run('INSERT INTO projectsTable VALUES (?,?,?,?,?,?,?,?,?)', id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive);

        await SqliteDatabase.setProjectSkills(id, skills);

        await SqliteDatabase.setProjectBidOffers(id, bidOffers);
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

