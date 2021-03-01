const User = require('../Model/User.js');
const Project = require('../Model/Project.js');
const knex = require('../DatabaseConfig/knex');

const UserModel = require('./Models/UserModel');
const UserSkillModel = require('./Models/UserSkillModel');
const UserActiveProjectModel = require('./Models/UserActiveProjectModel');
const UserInactiveProjectModel = require('./Models/UserInactiveProjectModel');
const UserTakenProjectModel = require('./Models/UserTakenProjectModel');
const UserEndorsedModel = require('./Models/UserEndorsedModel');

const ProjectModel = require('./Models/ProjectModel');
const ProjectBidOfferModel = require('./Models/ProjectBidOfferModel');
const ProjectSkillModel = require('./Models/ProjectSkillModel');

class SqliteDatabase {

    static async printUsersTable() {
        let users = await UserModel.query().withGraphFetched(`[
            skills(defaultSelects) as skills,
            activeProjectsIds(defaultSelects) as activeProjectsIds,
            inactiveProjectsIds(defaultSelects) as inactiveProjectsIds,
            takenProjectsIds(defaultSelects) as takenProjectsIds,
            endorsedOtherUsersSkillsList(defaultSelects) as endorsedOtherUsersSkillsList
        ]`);
        users = JSON.stringify(users);
        // users = JSON.parse(users);
        console.log(users);
    }

    static async printProjectsTable() {
        let projects = await ProjectModel.query().withGraphFetched(`[
            skills(defaultSelects) as skills,
            bidOffers(defaultSelects) as bidOffers,
        ]`);
        projects = JSON.stringify(projects);
        projects = JSON.parse(projects);
        console.log(projects);
    }

    //***********************get/set user(s) and project(s)**********************//

    static projectModelToProjectObject(projectModel) {
        try {
            let isActive = projectModel.isActive ? true : false;
            let bidOffersJSON = JSON.parse(JSON.stringify(projectModel.bidOffers));
            let skillsJSON = JSON.parse(JSON.stringify(projectModel.skills));
            let project = new Project(projectModel.id, projectModel.title, skillsJSON, projectModel.budget, projectModel.ownerId,
                bidOffersJSON, projectModel.description, projectModel.deadline, projectModel.winnerId, projectModel.imageURL, isActive);
            return project
        } catch (e) {
            return undefined;
        }
    }

    static userSkillsJSONToSkillsModel(skillsJSON, id) {
        let skillsModel = [];
        for (let i = 0; i < skillsJSON.length; i++) {
            let skillJSON = skillsJSON[i];
            skillsModel.push({
                userId: id,
                skillName: skillJSON.skillName,
                points: skillJSON.points
            })
        }
        return skillsModel
    }

    static projectSkillsJSONToSkillsModel(skillsJSON, id) {
        let skillsModel = [];
        for (let i = 0; i < skillsJSON.length; i++) {
            let skillJSON = skillsJSON[i];
            skillsModel.push({
                projectId: id,
                skillName: skillJSON.skillName,
                points: skillJSON.points
            })
        }
        return skillsModel
    }

    static projectJSONToProjectModel(projectsJSON, id) {
        let projectsModel = [];
        for (let i = 0; i < projectsJSON.length; i++) {
            let projectJSON = projectsJSON[i];
            projectsModel.push({
                userId: id,
                projectId: projectJSON
            });
        }
        return projectsModel;
    }

    static endorseJSONToEndorseModel(endorseListJSON, id) {
        let endorsedModel = [];
        for (let i = 0; i < endorseListJSON.length; i++) {
            let endorseObject = endorseListJSON[i];
            endorsedModel.push({
                userId: id,
                endorsedUserId: endorseObject.endorsedUserId,
                skillName: endorseObject.skillName
            });
        }
        return endorsedModel;
    }

    static userModelToUserObject(userModel) {
        try {
            let skillsJSON = JSON.parse(JSON.stringify(userModel.skills));
            let activeProjectsIdsJSON = SqliteDatabase.projectIdModelToProjectIdJSON(userModel.activeProjectsIds);
            let inactiveProjectsIdsJSON = SqliteDatabase.projectIdModelToProjectIdJSON(userModel.inactiveProjectsIds);
            let takenProjectsIdsJSON = SqliteDatabase.projectIdModelToProjectIdJSON(userModel.takenProjectsIds);
            let endorsedListJSON = JSON.parse(JSON.stringify(userModel.endorsedOtherUsersSkillsList));
            let user = new User(userModel.id, userModel.firstName, userModel.lastName, userModel.jobTitle, undefined, skillsJSON,
                activeProjectsIdsJSON, inactiveProjectsIdsJSON, takenProjectsIdsJSON, userModel.bio, userModel.profilePictureURL, endorsedListJSON);
            return user;
        } catch (e) {
            return undefined;
        }
    }

    static projectIdModelToProjectIdJSON(projectModelList) {
        let projectIdJSON = [];
        for (let i = 0; i < projectModelList.length; i++) {
            let id = projectModelList[i].projectId;
            projectIdJSON.push(projectModelList[i].projectId);
        }
        return projectIdJSON
    }

    static async getAllProjects() {
        let allProjectsModels, allProjects = [];
        allProjectsModels = await ProjectModel.query().withGraphFetched(`[
            skills(defaultSelects) as skills,
            bidOffers(defaultSelects) as bidOffers,
        ]`);
        for (let i = 0; i < allProjectsModels.length; i++) {
            let projectModel = allProjectsModels[i];
            let project = SqliteDatabase.projectModelToProjectObject(projectModel);
            allProjects.push(project);
        }
        return allProjects;
    }

    static async getProjectWithId(id) {
        try {
            let projectModel = await ProjectModel.query().withGraphFetched(`[
                skills(defaultSelects) as skills,
                bidOffers(defaultSelects) as bidOffers,
            ]`).where('id', id).then(projectList => projectList[0]);
            let project = SqliteDatabase.projectModelToProjectObject(projectModel)
            return project
        } catch (e) {
            return undefined;
        }
    }

    static async getAllUsers() {
        let allUsersModel, allUsers = [];
        allUsersModel = await UserModel.query().withGraphFetched(`[
            skills(defaultSelects) as skills,
            activeProjectsIds(defaultSelects) as activeProjectsIds,
            inactiveProjectsIds(defaultSelects) as inactiveProjectsIds,
            takenProjectsIds(defaultSelects) as takenProjectsIds,
            endorsedOtherUsersSkillsList(defaultSelects) as endorsedOtherUsersSkillsList
        ]`);
        for (let i = 0; i < allUsersModel.length; i++) {
            let userModel = allUsersModel[i];
            let user = SqliteDatabase.userModelToUserObject(userModel);
            allUsers.push(user);
        }
        return allUsers;
    }

    static async getUserWithId(id) {
        try {
            let userModel = await UserModel.query().withGraphFetched(`[
                skills(defaultSelects) as skills,
                activeProjectsIds(defaultSelects) as activeProjectsIds,
                inactiveProjectsIds(defaultSelects) as inactiveProjectsIds,
                takenProjectsIds(defaultSelects) as takenProjectsIds,
                endorsedOtherUsersSkillsList(defaultSelects) as endorsedOtherUsersSkillsList
            ]`).where('id', id).then(userList => userList[0]);
            let user = SqliteDatabase.userModelToUserObject(userModel);
            return user;
        } catch (e) {
            return undefined;
        }
    }

    static async addUser(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
        let skillsModel = SqliteDatabase.userSkillsJSONToSkillsModel(skills, id);
        let activeProjectsModel = SqliteDatabase.projectJSONToProjectModel(activeProjectIds, id);
        let inactiveProjectsModel = SqliteDatabase.projectJSONToProjectModel(inactiveProjectsIds, id);
        let takenProjectsModel = SqliteDatabase.projectJSONToProjectModel(takenProjectsIds, id);
        let endorsedListModel = SqliteDatabase.endorseJSONToEndorseModel(endorsedOtherUsersSkillsList);

        await UserModel.query().insertGraph({
                firstName: firstName,
                id: id,
                lastName: lastName,
                jobTitle: jobTitle,
                profilePictureURL: profilePictureURL,
                bio: bio,
                skills: skillsModel,
                activeProjectsIds: activeProjectsModel,
                inactiveProjectsIds: inactiveProjectsModel,
                takenProjectsIds: takenProjectsModel,
                endorsedOtherUsersSkillsList: endorsedListModel
            },
            {allowRefs: true});

    }

    static async addProject(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        let skillsModel = SqliteDatabase.projectSkillsJSONToSkillsModel(skills, id);
        await ProjectModel.query().insertGraph({
                id: id,
                title: title,
                budget: budget,
                ownerId: ownerId,
                description: description,
                deadline: deadline,
                winnerId: winnerId,
                imageURL: imageURL,
                isActive: isActive,
                skills: skillsModel,
                bidOffers: bidOffers,
            },
            {allowRefs: true});
    }

    //***********************user insert/update/delete/get **********************//

    static async getUserGeneralInformation(id) {
        let generalInformation;
        try {
            generalInformation = await UserModel.query().where('id', id).then(informationList => informationList[0])
        } catch (e) {
            generalInformation = undefined
        }
        return generalInformation
    }

    static async addProjectToTakenProjectsIds(id, projectId) {
        await UserTakenProjectModel.query().insert({
            userId: id,
            projectId: projectId
        });
    }

    static async addProjectToActiveProjectsIds(id, projectId) {
        await UserActiveProjectModel.query().insert({
            userId: id,
            projectId: projectId
        });
    }

    static async addProjectToInactiveProjectsIds(id, projectId) {
        await UserInactiveProjectModel.query().insert({
            userId: id,
            projectId: projectId
        });
    }

    static async addUserEndorsedOtherUsersSkillsList(id, endorsedObject) {
        await UserEndorsedModel.query().insert({
            userId: id,
            endorsedUserId: endorsedObject.endorsedUserId,
            skillName: endorsedObject.skillName
        });
    }

    static async removeProjectIdFromActiveProjectsIds(id, projectId) {
        await UserActiveProjectModel.query().delete().where({
            userId: id,
            projectId: projectId
        });
    }

    static async addUserSkill(id, skill) {
        await UserSkillModel.query().insert({
            userId: id,
            skillName: skill.skillName,
            points: skill.points
        });
    }

    static async removeUserSkill(id, skillName) {
        await UserSkillModel.query().delete().where({
            userId: id,
            skillName: skillName
        })
    }

    static async getEndorsedOtherUsersSkillsList(id) {
        let userEndorsedList = await UserEndorsedModel.query().select('endorsedUserId', 'skillName').where('userId', id);
        return userEndorsedList;
    }

    static async getUserSkills(id) {
        let usersSkills = UserSkillModel.query().select('skillName', 'points').where('userId', id);
        return usersSkills
    }


    static async setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList) {
        let currentEndorsedList;
        currentEndorsedList = await SqliteDatabase.getEndorsedOtherUsersSkillsList(id);

        for (let i = 0; i < currentEndorsedList.length; i++) {
            let currentEndorse = currentEndorsedList[i];
            if (!endorsedOtherUsersSkillsList.includes(currentEndorse)) {
                await UserEndorsedModel.query().delete().where({
                    userId: id,
                    endorsedUserId: currentEndorse.endorsedUserId,
                    skillName: currentEndorse.skillName
                });
            }
        }

        for (let i = 0; i < endorsedOtherUsersSkillsList.length; i++) {
            let newEndorse = endorsedOtherUsersSkillsList[i];
            if (!currentEndorsedList.includes(newEndorse)) {
                await UserEndorsedModel.query().insert({
                    userId: id,
                    endorsedUserId: newEndorse.endorsedUserId,
                    skillName: newEndorse.skillName
                });
            }
        }
    }


    static async increaseSkillPoints(id, skillName) {

        let currentPoint = await UserSkillModel.query().where({
            userId: id,
            skillName: skillName
        }).select('points').then(pointsList => pointsList[0]);
        let points = currentPoint.points + 1;
        await UserSkillModel.query().where({
            userId: id,
            skillName: skillName
        }).patch({
            points: points
        });
    }

//***********************project insert/update/delete/get **********************//

    static async addProjectBidOffer(id, bidOffer) {
        await ProjectBidOfferModel.query().insert({
            projectId: id,
            biddingUser: bidOffer.biddingUser,
            bidAmount: bidOffer.bidAmount
        });
    }

    static async setProjectWinnerId(id, winnerId) {
        await ProjectModel.query().where('id', id).patch({
            winnerId: winnerId
        });
    }

    static async setProjectIsActive(id, isActive) {
        await ProjectModel.query().where('id', id).patch({
            isActive: isActive
        });
    }

}

(async () => {
    // await ProjectModel.query().insert({
    //     id:'project1',
    //     title: 'shitStuff',
    //     budget: 100,
    //     ownerId: 'user1',
    //     description: 'for noobs',
    //     deadline: '1999992000',
    //     winnerId: null,
    //     imageURL: "googleeee.com",
    //     isActive: false
    // });
    // await ProjectSkillModel.query().insert({
    //     projectId: 'project1',
    //     skillName: 'HTTTP',
    //     points: 220
    // })
    // await ProjectBidOfferModel.query().insert({
    //     biddingUser: 'user2',
    //     projectId: 'project1',
    //     bidAmount: 1000
    // })
    // await SqliteDatabase.printUsersTable();
    // await UserModel.query().insert({
    //     id: "user2",
    //     firstName: "hamid",
    //     lastName: "yagh",
    //     jobTitle: "Back",
    //     bio: "nothing",
    //     profilePictureURL: "google.com"
    // });
    // await UserActiveProjectModel.query().insert({
    //     userId: "user1",
    //     projectId: "3"
    // });
    // await UserSkillModel.query().insert({
    //     skillName: "HTML",
    //     points: 90,
    //     userId: "user2"
    // });
    //
    // let res = await UserModel.query().where('id', 'user1').withGraphFetched(`[
    //   skills(defaultSelects) as skills,
    //   activeProjectsIds(defaultSelects) as activeProjectsIds
    //  ]`);
    // console.log(JSON.stringify(res))
    // await SqliteDatabase.printUsersTable();
    // let users = await UserModel.query().withGraphFetched(`[
    //         skills(defaultSelects) as skills,
    //         activeProjectsIds(defaultSelects) as activeProjectsIds,
    //         inactiveProjectsIds(defaultSelects) as inactiveProjectsIds,
    //         takenProjectsIds(defaultSelects) as takenProjectsIds,
    //         endorsedOtherUsersSkillsList(defaultSelects) as endorsedOtherUsersSkillsList
    //     ]`).where('id', 'user1').then(user => user[0]);
    // // console.log((SqliteDatabase.userModelToUserObject(users)))
    // let skills = users
    // console.log(skills);
    // let skills = await ProjectSkillModel.query();
    // console.log(skills)
    // let projects = await ProjectModel.query().withGraphFetched(`[
    //             skills(defaultSelects) as skills,
    //             bidOffers(defaultSelects) as bidOffers,
    //         ]`).then(projects => projects[0]);
    // await SqliteDatabase.addUser('6', 'alireza', 'heidari', "worker", [{skillName: 'PY', points: 10}, {skillName: "HTML", points: 90}], ['3'], ['1', '3'], [], "backend", 'amazon.jpg', [])
    // console.log(await SqliteDatabase.printUsersTable());
    // let use = ((await UserSkillModel.query()));
    // console.log()
    // console.log(use.)
    // console.log(await SqliteDatabase.removeUserSkill('6', 'PY'))
    await SqliteDatabase.increaseSkillPoints('6', "sf", "HTML")
    // await SqliteDatabase.addProject('project23' , "nothing" , [{skillName: "HTML" , points: 10} , {skillName: "CSS" ,points:2}] , 10 , '6' , [{biddingUser:'4' , projectId: 'project23' , bidAmount: 2}] , "asdf" , 2424234234 , null , "digikala", false)
    console.log(await SqliteDatabase.getUserWithId('6'));
    // console.log(await SqliteDatabase.printUsersTable())
    // console.log(await SqliteDatabase.getProjectWithId('project23'))
    // console.log(SqliteDatabase.projectModelToProjectObject(projects))
})();

module.exports = SqliteDatabase;
