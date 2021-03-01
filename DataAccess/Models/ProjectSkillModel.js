const {Model} = require('objection')
const knex = require('../../DatabaseConfig/knex');
const ProjectModel = require('./ProjectModel');


Model.knex(knex);

class ProjectSkillModel extends Model {
    static  tableName = "projectsSkillsTable";

    static get modifiers() {
        return {
            defaultSelects(builder) {
                builder.select('skillName', 'points');
            }
        };
    }

    static relationMappings = {
        projectBidOffers: {
            relation: Model.BelongsToOneRelation,
            modelClass: ProjectModel,
            join: {
                from: 'projectsSkillsTable.projectId',
                to: 'projectsTable.id'
            }
        }
    }
}

module.exports = ProjectSkillModel;