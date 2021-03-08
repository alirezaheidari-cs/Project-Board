const {Model} = require('objection')
const UserModel = require('./UserModel')
const knex = require('/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/knex');
Model.knex(knex);

class UserSkillModel extends Model {
    static get tableName() {
        return "usersSkillsTable";
    }

    static get modifiers() {
        return {
            defaultSelects(builder) {
                builder.select('skillName', 'points');
            }
        };
    }

    static relationMappings = {
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserModel,
            join: {
                from: 'usersSkillsTable.userId',
                to: 'user.id'
            }
        }
    }
}

module.exports = UserSkillModel;