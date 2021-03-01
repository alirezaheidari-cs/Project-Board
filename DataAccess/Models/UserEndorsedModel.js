const UserModel = require('./UserModel');
const {Model} = require("objection");
const knex = require('../../DatabaseConfig/knex');

Model.knex(knex);
class UserEndorsedModel extends Model{
    static tableName = "usersEndorsedOtherUsersSkillsListTable";

    static get modifiers() {
        return {
            defaultSelects(builder) {
                builder.select('endorsedUserId', 'skillName');
            }
        };
    }

    static relationMappings = {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserModel,
            join: {
                from: 'usersEndorsedOtherUsersSkillsListTable.userId',
                to: 'usersTable.id'
            }
        }
    }
}

module.exports = UserEndorsedModel;