const UserModel = require('./UserModel');
const {Model} = require("objection");
const knex = require('../../DatabaseConfig/knex');

Model.knex(knex);
class UserTakenProjectModel extends Model{
    static tableName = "usersTakenProjectsIdsTable";

    static get modifiers() {
        return {
            defaultSelects(builder) {
                builder.select('projectId');
            }
        };
    }


    static relationMappings = {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserModel,
            join: {
                from: 'usersTakenProjectsIdsTable.userId',
                to: 'usersTable.id'
            }
        }
    }
}

module.exports = UserTakenProjectModel;