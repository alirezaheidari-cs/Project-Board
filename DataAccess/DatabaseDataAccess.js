const User = require('/home/tapsi/Tapsi/project1_joboonja/final/Model/User');
const Project = require('../Model/Project');
const Skill = require('../Model/Skill');
const BidOffer = require('../Model/BidOffer');
const Endorsement = require('../Model/Endorsement');
const UserModel = require('./Models/UserModel');
const UserSkillModel = require('./Models/UserSkillModel');
const UserActiveProjectModel = require('./Models/UserActiveProjectModel');
const UserInactiveProjectModel = require('./Models/UserInactiveProjectModel');
const UserTakenProjectModel = require('./Models/UserTakenProjectModel');
const UserEndorsedModel = require('./Models/UserEndorsedModel');
const ProjectModel = require('./Models/ProjectModel');
const ProjectBidOfferModel = require('./Models/ProjectBidOfferModel');
const ProjectSkillModel = require('./Models/ProjectSkillModel');


class DatabaseDataAccess {

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
            let bidOffersObject = DatabaseDataAccess.convertBidOffersModelListToObject(projectModel.bidOffers);
            let skillsObject = DatabaseDataAccess.convertSkillModelListToObject(projectModel.skills);
            let project = new Project(projectModel.id, projectModel.title, skillsObject, projectModel.budget, projectModel.ownerId,
                bidOffersObject, projectModel.description, projectModel.deadline, projectModel.winnerId, projectModel.imageURL, isActive);
            return project
        } catch (e) {
            return undefined;
        }
    }

    static userSkillsObjectToSkillsModel(skillsObject, id) {
        let skillsModel = [];
        for (let i = 0; i < skillsObject.length; i++) {
            let skillObject = skillsObject[i];
            skillsModel.push({
                userId: id,
                skillName: skillObject.skillName,
                points: parseInt(skillObject.points)
            })
        }
        return skillsModel
    }

    static projectSkillsObjectsToSkillsModel(skillsObjects, id) {
        let skillsModel = [];
        for (let i = 0; i < skillsObjects.length; i++) {
            let skillObject = skillsObjects[i];
            skillsModel.push({
                projectId: id,
                skillName: skillObject.skillName,
                points: parseInt(skillObject.points)
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

    static endorseObjectToEndorseModel(endorseListJSON, id) {
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

    static convertSkillModelListToObject(skillsModel) {
        let skills = [];
        for (let i = 0; i < skillsModel.length; i++) {
            let skill = new Skill(skillsModel[i].skillName, parseInt(skillsModel[i].points));
            skills.push(skill);
        }
        return skills;
    }

    static convertBidOffersModelListToObject(bidOffersModel) {
        let bidOffers = [];
        for (let i = 0; i < bidOffersModel.length; i++) {
            let bidOffer = new BidOffer(bidOffersModel[i].biddingUser, bidOffersModel[i].projectId, parseInt(bidOffersModel[i].bidAmount));
            bidOffers.push(bidOffer);
        }
        return bidOffers;
    }

    static convertEndorsementModelListToObject(endorsementModel) {
        let endorsements = [];
        for (let i = 0; i < endorsementModel.length; i++) {
            let endorsement = new Endorsement(endorsementModel[i].endorsedUserId, endorsementModel[i].userId, endorsementModel[i].skillName);
            endorsements.push(endorsement);
        }
        return endorsements;
    }

    static userModelToUserObject(userModel) {
        try {
            let skillsObject = DatabaseDataAccess.convertSkillModelListToObject(userModel.skills);
            let activeProjectsIdsJSON = DatabaseDataAccess.projectIdModelToProjectIdJSON(userModel.activeProjectsIds);
            let inactiveProjectsIdsJSON = DatabaseDataAccess.projectIdModelToProjectIdJSON(userModel.inactiveProjectsIds);
            let takenProjectsIdsJSON = DatabaseDataAccess.projectIdModelToProjectIdJSON(userModel.takenProjectsIds);
            let endorsedListObject = DatabaseDataAccess.convertEndorsementModelListToObject(userModel.endorsedOtherUsersSkillsList);
            let user = new User(userModel.id, userModel.firstName, userModel.lastName, userModel.jobTitle, undefined, skillsObject,
                activeProjectsIdsJSON, inactiveProjectsIdsJSON, takenProjectsIdsJSON, userModel.bio, userModel.profilePictureURL, endorsedListObject);
            return user;
        } catch (e) {
            return undefined;
        }
    }

    static projectIdModelToProjectIdJSON(projectModelList) {
        let projectIdJSON = [];
        for (let i = 0; i < projectModelList.length; i++) {
            projectIdJSON.push(projectModelList[i].projectId);
        }
        return projectIdJSON
    }

    static projectBidOfferObjectToBidOfferModel(bidOffersObjects) {
        let bidOffersModel = [];
        for (let i = 0; i < bidOffersObjects.length; i++) {
            let bidOfferObject = bidOffersObjects[i];
            bidOffersModel.push({
                biddingUser: bidOfferObject.biddingUser,
                projectId: bidOfferObject.projectId,
                bidAmount: parseInt(bidOfferObject.bidAmount)
            });
        }
        return bidOffersModel
    }

    static async getAllProjects() {
        let allProjectsModels, allProjects = [];
        allProjectsModels = await ProjectModel.query().withGraphFetched(`[
            skills(defaultSelects) as skills,
            bidOffers(defaultSelects) as bidOffers,
        ]`);
        for (let i = 0; i < allProjectsModels.length; i++) {
            let projectModel = allProjectsModels[i];
            let project = DatabaseDataAccess.projectModelToProjectObject(projectModel);
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
            let project = DatabaseDataAccess.projectModelToProjectObject(projectModel)
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
            endorsedOtherUsersSkillsList as endorsedOtherUsersSkillsList
        ]`);
        for (let i = 0; i < allUsersModel.length; i++) {
            let userModel = allUsersModel[i];
            let user = DatabaseDataAccess.userModelToUserObject(userModel);
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
                endorsedOtherUsersSkillsList as endorsedOtherUsersSkillsList
            ]`).where('id', id).then(userList => userList[0]);
            let user = DatabaseDataAccess.userModelToUserObject(userModel);
            return user;
        } catch (e) {
            return undefined;
        }
    }

    static async addUser(id, firstName, lastName, jobTitle, skills, activeProjectIds, inactiveProjectsIds, takenProjectsIds, bio, profilePictureURL, endorsedOtherUsersSkillsList) {
        let skillsModel = DatabaseDataAccess.userSkillsObjectToSkillsModel(skills, id);
        let activeProjectsModel = DatabaseDataAccess.projectJSONToProjectModel(activeProjectIds, id);
        let inactiveProjectsModel = DatabaseDataAccess.projectJSONToProjectModel(inactiveProjectsIds, id);
        let takenProjectsModel = DatabaseDataAccess.projectJSONToProjectModel(takenProjectsIds, id);
        let endorsedListModel = DatabaseDataAccess.endorseObjectToEndorseModel(endorsedOtherUsersSkillsList);

        try {
            return await UserModel.query().insertGraph({
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
        } catch (e) {
            return undefined;
        }

    }

    static async addProject(id, title, skills, budget, ownerId, bidOffers, description, deadline, winnerId, imageURL, isActive) {
        let skillsModel = DatabaseDataAccess.projectSkillsObjectsToSkillsModel(skills, id);
        let bidOfferModel = DatabaseDataAccess.projectBidOfferObjectToBidOfferModel(bidOffers);
        try {
            return await ProjectModel.query().insertGraph({
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
                    bidOffers: bidOfferModel,
                },
                {allowRefs: true});
        } catch (e) {
            return undefined
        }

    }

    //***********************user insert/update/delete/get **********************//

    static async getUserGeneralInformation(id) {
        let generalInformation;
        try {
            generalInformation = await UserModel.query().where('id', id).then(informationList => informationList[0])
        } catch (e) {
            generalInformation = undefined
        }
        return JSON.parse(JSON.stringify(generalInformation));
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
            points: parseInt(skill.points)
        });
    }

    static async removeUserSkill(id, skillName) {
        await UserSkillModel.query().delete().where({
            userId: id,
            skillName: skillName
        })
    }

    static async getEndorsedOtherUsersSkillsList(id) {
        let userEndorsedList = await UserEndorsedModel.query().where('userId', id);
        return DatabaseDataAccess.convertEndorsementModelListToObject(userEndorsedList);
    }

    static async getUserSkills(id) {
        let usersSkills = await UserSkillModel.query().select('skillName', 'points').where('userId', id);
        return DatabaseDataAccess.convertSkillModelListToObject(usersSkills);
    }

    static async setUserEndorsedOtherUsersSkillsList(id, endorsedOtherUsersSkillsList) {
        let currentEndorsedList;
        currentEndorsedList = await DatabaseDataAccess.getEndorsedOtherUsersSkillsList(id);

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
        let userSkillRow = await UserSkillModel.query().where({
            userId: id,
            skillName: skillName
        }).then(rows => rows[0]);
        let points = parseInt(userSkillRow.points) + 1;
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
            bidAmount: parseInt(bidOffer.bidAmount)
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


module.exports = DatabaseDataAccess;
//

//
