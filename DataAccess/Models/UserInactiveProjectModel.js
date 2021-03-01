const UserModel = require('./UserModel');
const {Model} = require("objection");
const knex = require('../../DatabaseConfig/knex');

Model.knex(knex);
class UserInactiveProjectModel extends Model{
    static tableName = "usersInactiveProjectsIdsTable";

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
                from: 'usersInactiveProjectsIdsTable.userId',
                to: 'usersTable.id'
            }
        }
    }
}

module.exports = UserInactiveProjectModel;