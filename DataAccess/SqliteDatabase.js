const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const User = require('../Model/User.js');
const Project = require('../Model/Project.js');
const CryptoJS = require("crypto-js");
const randToken = require('rand-token');
const jwt = require('jsonwebtoken');
const knex = require('knex')

class SqliteDatabase {

    static usersDb;
    static projectsDb;
    static usersKnex;
    static projectsKnex;

    //***********************run database**********************//


    static async createUsersTables() {

        try {
            await SqliteDatabase.usersKnex.schema.createTableIfNotExists('usersTable', function (table) {
                table.string('id');
                table.string('firstName');
                table.string('lastName');
                table.string('jobTitle');
                table.string('bio');
                table.string('profilePictureURL');
            });

            await SqliteDatabase.usersKnex.schema.createTableIfNotExists('usersSkillsTable', function (table) {
                table.string('userId');
                table.string('skillName');
                table.bigInteger('points');
            });
            await SqliteDatabase.usersKnex.schema.createTableIfNotExists('usersActiveProjectsIdsTable', function (table) {
                table.string('userId');
                table.string('projectId');

            });
            await SqliteDatabase.usersKnex.schema.createTableIfNotExists('usersInactiveProjectsIdsTable', function (table) {
                table.string('userId');
                table.string('projectId');

            });
            await SqliteDatabase.usersKnex.schema.createTableIfNotExists('usersTakenProjectsIdsTable', function (table) {
                table.string('userId');
                table.string('projectId');

            });
            await SqliteDatabase.usersKnex.schema.createTableIfNotExists('usersEndorsedOtherUsersSkillsListTable', function (table) {
                table.string('userId');
                table.string('endorsedUserId');
                table.string('skillName');
            });
            console.log("users table created successfulluy")
            // await SqliteDatabase.usersDb.exec('CREATE TABLE usersTable (id, firstName, lastName, jobTitle, bio, profilePictureURL)');
            // await SqliteDatabase.usersDb.exec('CREATE TABLE usersSkillsTable (userId, skillName, points)');
            // await SqliteDatabase.usersDb.exec('CREATE TABLE usersActiveProjectsIdsTable (userId, projectId)');
            // await SqliteDatabase.usersDb.exec('CREATE TABLE usersInactiveProjectsIdsTable (userId, projectId)');
            // await SqliteDatabase.usersDb.exec('CREATE TABLE usersTakenProjectsIdsTable (userId, projectId)');
            // await SqliteDatabase.usersDb.exec('CREATE TABLE usersEndorsedOtherUsersSkillsListTable (userId, endorsedUserId, skillName)');
        } catch (e) {

        }
    }

    static async createProjectsTables() {
        try {
            await SqliteDatabase.projectsKnex.schema.createTableIfNotExists('projectsTable', function (table) {
                table.string('id');
                table.string('title');
                table.bigInteger('budget');
                table.string('ownerId');
                table.string('description');
                table.bigInteger('deadline');
                table.string('winnerId');
                table.string('imageURL');
                table.boolean('isActive');
            });
            await SqliteDatabase.projectsKnex.schema.createTableIfNotExists('projectsSkillsTable', function (table) {
                table.string('projectId');
                table.string('skillName');
                table.bigInteger('points');
            });
            await SqliteDatabase.projectsKnex.schema.createTableIfNotExists('projectsBidOffersTable', function (table) {
                table.string('projectId');
                table.string('biddingUser');
                table.bigInteger('bidAmount');
            });
            console.log("projects tables created")
            // await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsTable (id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive)');
            // await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsSkillsTable (projectId, skillName , points)');
            // await SqliteDatabase.projectsDb.exec('CREATE TABLE projectsBidOffersTable (projectId, biddingUser , bidAmount)');
        } catch (e) {

        }
    }

    static async printUsersTable(){
        console.log("*****************************************")
        console.log(await SqliteDatabase.usersKnex('usersTable').select('*'))
        console.log(await SqliteDatabase.usersKnex('usersSkillsTable').select('*'))
        console.log(await SqliteDatabase.usersKnex('usersActiveProjectsIdsTable').select('*'))
        console.log(await SqliteDatabase.usersKnex('usersInactiveProjectsIdsTable').select('*'))
        console.log(await SqliteDatabase.usersKnex('usersTakenProjectsIdsTable').select('*'))
        console.log(await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').select('*'))
        console.log("*****************************************")
    }
    static async printProjectsTable(){
        console.log("*****************************************")
        console.log(await SqliteDatabase.projectsKnex('projectsTable').select('*'))
        console.log(await SqliteDatabase.projectsKnex('projectsSkillsTable').select('*'))
        console.log(await SqliteDatabase.projectsKnex('projectsBidOffersTable').select('*'))
        console.log("*****************************************")
    }

    static async runDatabase(dbPath) {
        SqliteDatabase.usersKnex = knex({
            client: 'sqlite3',
            connection: {
                filename: dbPath + "users.sqlite"
            },
            useNullAsDefault: true
        });

        SqliteDatabase.projectsKnex = knex({
            client: 'sqlite3',
            connection: {
                filename: dbPath + "projects.sqlite"
            },
            useNullAsDefault: true
        });

        await SqliteDatabase.createUsersTables();
        await SqliteDatabase.createProjectsTables();
        await SqliteDatabase.printUsersTable();
        await SqliteDatabase.printProjectsTable()
        // console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersTable'));
        // console.log("users skills");
        // console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersSkillsTable'));
        // console.log("users active projects");
        // console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersActiveProjectsIdsTable'));
        // console.log("users inactive projects");
        // console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersInactiveProjectsIdsTable'));
        // console.log("users taken projects");
        // console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersTakenProjectsIdsTable'));
        // console.log("users endorsed list");
        // console.log(await SqliteDatabase.usersDb.all('SELECT * FROM usersEndorsedOtherUsersSkillsListTable'));
        // console.log("****************************************")
        // console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsTable'));
        // console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsSkillsTable'));
        // console.log(await SqliteDatabase.projectsDb.all('SELECT * FROM projectsBidOffersTable'));
        // console.log("****************************************")
    }

    //***********************get/set user(s) and project(s)**********************//

    static async getAllProjects() {
        let allProjectIds;
        allProjectIds = await SqliteDatabase.projectsKnex.select('id').from('projectsTable');
        // allProjectIds = await SqliteDatabase.projectsDb.all('SELECT id FROM projectsTable WHERE 1 = 1');
        let allProjects = [];
        for (let i = 0; i < allProjectIds.length; i++) {
            let projectId = allProjectIds[i].id;
            let project = await SqliteDatabase.getProjectWithId(projectId)
            allProjects.push(project);
        }
        return allProjects;
    }

    static async getProjectWithId(id) {
        let project = undefined;
        try {
            let projectInformation = (await SqliteDatabase.projectsKnex('projectsTable').where('id', id).select('*'))[0]
            let projectBidOffers = await SqliteDatabase.projectsKnex('projectsBidOffersTable').where('projectId', id).select('biddingUser', 'projectId', 'bidAmount')
            let projectsSkills = await SqliteDatabase.projectsKnex('projectsSkillsTable').where('projectId', id).select('skillName', 'points')
            // let projectInformation = await SqliteDatabase.projectsDb.get('SELECT * FROM projectsTable WHERE id = ?', id);
            // let projectBidOffers = await SqliteDatabase.projectsDb.all('SELECT biddingUser, projectId , bidAmount  FROM projectsBidOffersTable WHERE projectId = ?', id);
            // let projectsSkills = await SqliteDatabase.projectsDb.all('SELECT skillName , points  FROM projectsSkillsTable WHERE projectId = ?', id);

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
        allUsersIds = await SqliteDatabase.usersKnex('usersTable').select('id')
        // allUsersIds = await SqliteDatabase.usersDb.all('SELECT id FROM usersTable WHERE 1 = 1');
        let allUsers = [];
        for (let i = 0; i < allUsersIds.length; i++) {
            let userId = allUsersIds[i].id;
            let user = await SqliteDatabase.getUserWithId(userId);
            allUsers.push(user);
        }
        return allUsers;
    }

    static async getUserWithId(id) {
        let user;
        try {
            let userInformation = (await SqliteDatabase.usersKnex('usersTable').where('id', id).select('*'))[0];
            let userSkills = await SqliteDatabase.usersKnex('usersSkillsTable').where('userId', id).select('skillName', 'points');
            let userActiveProjects = await SqliteDatabase.usersKnex('usersActiveProjectsIdsTable').where('userId', id).select('projectId');
            let userInactiveProjects = await SqliteDatabase.usersKnex('usersInactiveProjectsIdsTable').where('userId', id).select('projectId');
            let userTakenProjects = await SqliteDatabase.usersKnex('usersTakenProjectsIdsTable').where('userId', id).select('projectId');
            let userEndorsedOtherUserSkillsList = await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').where('userId', id).select('endorsedUserId', 'skillName');
            // let userInformation = await SqliteDatabase.usersDb.get('SELECT *  FROM usersTable WHERE id = ?', id);
            // let userSkills = await SqliteDatabase.usersDb.all('SELECT skillName , points  FROM usersSkillsTable WHERE userId = ?', id);
            // let userActiveProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersActiveProjectsIdsTable WHERE userId = ?', id);
            // let userInactiveProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersInactiveProjectsIdsTable WHERE userId = ?', id);
            // let userTakenProjects = await SqliteDatabase.usersDb.all('SELECT projectId  FROM usersTakenProjectsIdsTable WHERE userId = ?', id);
            // let userEndorsedOtherUserSkillsList = await SqliteDatabase.usersDb.all('SELECT  endorsedUserId , skillName FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
            user = new User(userInformation.id, userInformation.firstName, userInformation.lastName,
                userInformation.jobTitle, undefined, userSkills, userActiveProjects, userInactiveProjects, userTakenProjects, userInformation.bio, userInformation.profilePictureURL, userEndorsedOtherUserSkillsList);
        } catch (e) {
            user = undefined;
        }
        return user;
    }

    static async addUser(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {

        await SqliteDatabase.usersKnex('usersTable').insert({
            id: id, firstName: firstName, lastName: lastName, jobTitle: jobTitle,
            bio: bio, profilePictureURL: profilePictureURL
        })

        // await SqliteDatabase.usersDb.run('INSERT INTO usersTable VALUES  (?,?,?,?,?,?)', id, firstName, lastName, jobTitle, bio, profilePictureURL);

        await SqliteDatabase.setUserSkills(id, skills);

        await SqliteDatabase.setUserActiveProjects(id, activeProjectIds);

        await SqliteDatabase.setUserInactiveProjects(id, inactiveProjectsIds);

        await SqliteDatabase.setUserTakenProjects(id, takenProjectsIds);

        await SqliteDatabase.setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList);

    }

    static async addProject(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        await SqliteDatabase.projectsKnex('projectsTable').insert({
            id: id,
            title: title,
            budget: budget,
            ownerId: ownerId,
            description: description,
            deadline: deadline,
            winnerId: winnerId,
            imageURL: imageURL,
            isActive: isActive
        })
        // await SqliteDatabase.projectsDb.run('INSERT INTO projectsTable VALUES (?,?,?,?,?,?,?,?,?)', id, title, budget, ownerId, description, deadline, winnerId, imageURL, isActive);

        await SqliteDatabase.setProjectSkills(id, skills);

        await SqliteDatabase.setProjectBidOffers(id, bidOffers);
    }

    static async getAllUsersIds() {
        let allUsersIds;
        allUsersIds = await SqliteDatabase.usersDb.all('SELECT id FROM usersTable WHERE 1=1');
        return allUsersIds;
    }

    //***********************user insert/update/delete/get **********************//

    static async getUserGeneralInformation(id) {
        let generalInformation;
        try {
            generalInformation = (await SqliteDatabase.usersKnex('usersTable').where('id', id).select('*'))[0]
        } catch (e) {
            generalInformation = undefined
        }
        return generalInformation
        // return await SqliteDatabase.usersDb.get('SELECT * FROM usersTable WHERE id = ?', id);
    }

    static async addProjectToTakenProjectsIds(id, projectId) {
        await SqliteDatabase.projectsKnex('usersTakenProjectsIdsTable').insert({
            id: id,
            projectId: projectId
        })
        // await SqliteDatabase.usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES (?,?)', id, projectId);
    }

    static async addProjectToActiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersKnex('usersActiveProjectsIdsTable').insert({
            userId: id,
            projectId: projectId
        });
        // await SqliteDatabase.usersDb.run('INSERT INTO usersActiveProjectsIdsTable VALUES (? , ?)', id, projectId);
    }

    static async addProjectToInactiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersKnex('usersInactiveProjectsIdsTable').insert({
            userId: id,
            projectId: projectId
        })
        // await SqliteDatabase.usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES (?,?)', id, projectId);
    }

    static async addUserEndorsedOtherUsersSkillsList(id, endorsedObject) {
        await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').insert({
            userId: id,
            endorsedUserId: endorsedObject.endorsedUserId,
            skillName: endorsedObject.skillName
        })
        // await SqliteDatabase.usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES (?,?,?)', id, endorsedObject.endorsedUserId, endorsedObject.skillName);
    }

    static async removeProjectIdFromActiveProjectsIds(id, projectId) {
        await SqliteDatabase.usersKnex('usersActiveProjectsIdsTable').where({
            userId: id,
            projectId: projectId
        }).del();
        // await SqliteDatabase.usersDb.run('DELETE FROM usersActiveProjectsIdsTable WHERE userId = ? and projectId = ?', id, projectId);
    }

    static async addUserSkill(id, skill) {
        await SqliteDatabase.usersKnex('usersSkillsTable').insert({
            userId: id,
            skillName: skill.skillName,
            points: skill.points
        });
        // await SqliteDatabase.usersDb.run('INSERT INTO usersSkillsTable VALUES (?,?,?)', id, skill.skillName, skill.points);
    }

    static async removeUserSkill(id, skillName) {
        await SqliteDatabase.usersKnex('usersSkillsTable').where({
            userId: id,
            skillName: skillName
        }).del();
        // await SqliteDatabase.usersDb.run('DELETE FROM usersSkillsTable WHERE userId = ? and skillName = ?', id, skillName);
    }

    static async setUserSkills(id, skills) {
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await SqliteDatabase.usersKnex('usersSkillsTable').insert({
                userId: id,
                skillName: skill.skillName,
                points: skill.points
            })
            // await SqliteDatabase.usersDb.run('INSERT INTO usersSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }
    }

    static async getEndorsedOtherUsersSkillsList(id) {
        return await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').where('userId', id).select('endorsedUserId', 'skillName');
        // return await SqliteDatabase.usersDb.all('SELECT endorsedUserId , skillName  FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);
    }

    static async getUserSkills(id) {
        return await SqliteDatabase.usersKnex('usersSkillsTable').where('userId', id).select('skillName', 'points');
        // return await SqliteDatabase.usersDb.all('SELECT skillName , points FROM usersSkillsTable WHERE userId = ?', id);
    }

    static async setUserActiveProjects(id, activeProjectsIds) {
        for (let i = 0; i < activeProjectsIds.length; i++) {
            let activeProject = activeProjectsIds[i]
            await SqliteDatabase.usersKnex('usersActiveProjectsIdsTable').insert({
                userId: id,
                projectId: activeProject
            });
            // await SqliteDatabase.usersDb.run('INSERT INTO usersActiveProjectsIdsTable VALUES  (?,?)', [id, activeProject]);
        }
    }

    static async setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList) {
        let currentEndorsedList;
        currentEndorsedList = await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').where('userId', id).select('endorsedUserId', 'skillName');
        // currentEndorsedList = await SqliteDatabase.usersDb.all('SELECT endorsedUserId, skillName FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ?', id);

        for (let i = 0; i < currentEndorsedList.length; i++) {
            let currentEndorse = currentEndorsedList[i];
            if (!endorsedOtherUsersSkillsList.includes(currentEndorse)) {
                await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').where({
                    userId: id,
                    endorsedUserId: currentEndorse.endorsedUserId,
                    skillName: currentEndorse.skillName
                }).del();
                // await SqliteDatabase.usersDb.run('DELETE FROM usersEndorsedOtherUsersSkillsListTable WHERE userId = ? and endorsedUserId = ? and skillName = ?', id, currentEndorse.endorsedUserId, currentEndorse.skillName);
            }
        }

        for (let i = 0; i < endorsedOtherUsersSkillsList.length; i++) {
            let newEndorse = endorsedOtherUsersSkillsList[i];
            if (!currentEndorsedList.includes(newEndorse)) {
                await SqliteDatabase.usersKnex('usersEndorsedOtherUsersSkillsListTable').insert({
                    userId: id,
                    endorsedUserId: newEndorse.endorsedUserId,
                    skillName: newEndorse.skillName
                })
                // await SqliteDatabase.usersDb.run('INSERT INTO usersEndorsedOtherUsersSkillsListTable VALUES  (?,?,?)', [id, newEndorse.endorsedUserId, newEndorse.skillName]);
            }
        }
    }

    static async setUserInactiveProjects(id, inactiveProjectIds) {
        for (let i = 0; i < inactiveProjectIds.length; i++) {
            let inactiveProjectId = inactiveProjectIds[i];
            await SqliteDatabase.usersKnex('usersInactiveProjectsIdsTable').insert({
                userId: id,
                projectId: inactiveProjectId
            })
            // await SqliteDatabase.usersDb.run('INSERT INTO usersInactiveProjectsIdsTable VALUES  (?,?)', id, inactiveProjectId);
        }
    }

    static async setUserTakenProjects(id, takenProjectsIds) {
        for (let i = 0; i < takenProjectsIds.length; i++) {
            let takenProjectId = takenProjectsIds[i];
            await SqliteDatabase.usersKnex('usersTakenProjectsIdsTable').insert({
                userId: id,
                projectId: takenProjectsIds
            })
            // await SqliteDatabase.usersDb.run('INSERT INTO usersTakenProjectsIdsTable VALUES  (?,?)', [id, takenProjectId]);
        }
    }

    static async increaseSkillPoints(id, endorsedUserId, skillName) {
        let currentPoint = (await SqliteDatabase.usersKnex('usersSkillsTable').where({
            userId: id,
            skillName: skillName
        }).select('points'))[0];
        // let currentPoint = await SqliteDatabase.usersDb.get('SELECT points FROM usersSkillsTable WHERE userId = ? and skillName = ?', id, skillName);
        let points = currentPoint.points + 1;
        await SqliteDatabase.usersKnex('usersSkillsTable').where({
            userId: id,
            skillName: skillName
        }).update('points', points);
        // await SqliteDatabase.usersDb.run('UPDATE usersSkillsTable SET points = ? WHERE userId = ? and skillName = ?', points, id, skillName);
    }

    //***********************project insert/update/delete/get **********************//

    static async setProjectSkills(id, skills) {
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            await SqliteDatabase.projectsKnex('projectsSkillsTable').insert({
                projectId: id,
                skillName: skill.skillName,
                points: skill.points
            });
            // await SqliteDatabase.projectsDb.run('INSERT INTO projectsSkillsTable VALUES  (?,?,?)', id, skill.skillName, skill.points);
        }
    }

    static async setProjectBidOffers(id, bidOffers) {
        for (let i = 0; i < bidOffers.length; i++) {
            let bidOffer = bidOffers[i];
            await SqliteDatabase.projectsKnex('projectsBidOffersTable').insert({
                projectId: id,
                biddingUser: bidOffer.biddingUser,
                bidAmount: bidOffer.bidAmount
            })
            // await SqliteDatabase.projectsDb.run('INSERT INTO projectsBidOffersTable VALUES (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
        }
    }

    static async addProjectBidOffer(id, bidOffer) {
        await SqliteDatabase.projectsKnex('projectsBidOffersTable').insert({
            projectId: id,
            biddingUser: bidOffer.biddingUser,
            bidAmount: bidOffer.bidAmount
        })
        // await SqliteDatabase.projectsDb.run('INSERT INTO projectsBidOffersTable VALUES (?,?,?)', id, bidOffer.biddingUser, bidOffer.bidAmount);
    }

    static async setProjectWinnerId(id, winnerId) {
        await SqliteDatabase.projectsKnex('projectsTable').where('id', id).update('winnerId', winnerId);
        // await SqliteDatabase.projectsDb.run('UPDATE projectsTable SET winnerId = ? WHERE id = ?', winnerId, id);
    }

    static async setProjectIsActive(id, isActive) {
        await SqliteDatabase.projectsKnex('projectsTable').where('id', id).update('isActive', isActive);
        // await SqliteDatabase.projectsDb.run('UPDATE projectsTable SET isActive = ? WHERE id = ?', isActive, id);
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// (async () => {
//     await SqliteDatabase.runDatabase("DB/");
//     console.log("*******************")
//     console.log(await SqliteDatabase.usersKnex.select('*').from('usersSkillsTable'))
//     // let id = await SqliteDatabase.getUserIdWithToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidXNlcjIiLCJ0aW1lIjoxNjE0MDc5OTMwMzc3fSwiaWF0IjoxNjE0MDc5OTMwLCJleHAiOjE2MTQwNzk5MzF9.J68XDF9iRoeoMOPipYlTBmkdIpJPlAbwMr9ydq8-dS4");
//     // await SqliteDatabase.isThisTokenValidForUser("user1", "");
//     // await SqliteDatabase.isThisTokenValidForUser("user2", "");
//     // console.log(id)
// })();
module.exports = SqliteDatabase;
