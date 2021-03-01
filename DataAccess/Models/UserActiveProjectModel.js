const {Model} = require('objection')
const UserModel = require('./UserModel');
const knex = require('../../DatabaseConfig/knex');

Model.knex(knex);
class UserActiveProjectsModel extends Model{
    static tableName = "usersActiveProjectsIdsTable";

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
                from: 'usersActiveProjectsIdsTable.userId',
                to: 'usersTable.id'
            }
        }
    }
}

module.exports = UserActiveProjectsModel;