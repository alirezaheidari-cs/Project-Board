const {Model} = require('objection')
const UserSkillModel = require('./UserSkillModel');
const UserActiveProjectModel = require('./UserActiveProjectModel');
const UserInactiveProjectModel = require('./UserInactiveProjectModel');
const UserTakenProjectModel = require('./UserTakenProjectModel');
const UserEndorseModel = require('./UserEndorsedModel');
const knex = require('../../DatabaseConfig/knex');

Model.knex(knex);
class UserModel extends Model {
    static get tableName() {
        return "usersTable";
    }

    static relationMappings = {
        skills: {
            relation: Model.HasManyRelation,
            modelClass: UserSkillModel,
            join: {
                from: 'usersTable.id',
                to: 'usersSkillsTable.userId'
            }
        },
        activeProjectsIds: {
            relation: Model.HasManyRelation,
            modelClass: UserActiveProjectModel,
            join: {
                from: 'usersTable.id',
                to: 'usersActiveProjectsIdsTable.userId'
            }
        },
        inactiveProjectsIds: {
            relation: Model.HasManyRelation,
            modelClass: UserInactiveProjectModel,
            join: {
                from: 'usersTable.id',
                to: 'usersInactiveProjectsIdsTable.userId'
            }
        },
        takenProjectsIds: {
            relation: Model.HasManyRelation,
            modelClass: UserTakenProjectModel,
            join: {
                from: 'usersTable.id',
                to: 'usersTakenProjectsIdsTable.userId'
            }
        },
        endorsedOtherUsersSkillsList: {
            relation: Model.HasManyRelation,
            modelClass: UserEndorseModel,
            join: {
                from: 'usersTable.id',
                to: 'usersEndorsedOtherUsersSkillsListTable.userId'
            }
        }
    }
}

module.exports = UserModel;