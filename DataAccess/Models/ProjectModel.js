const {Model} = require('objection')
const knex = require('../../DatabaseConfig/knex');
const ProjectSkillModel = require('./ProjectSkillModel');
const ProjectBidOfferModel = require('./ProjectBidOfferModel')


Model.knex(knex);

class ProjectModel extends Model {
    static  tableName = "projectsTable";
    static relationMappings = {
        bidOffers: {
            relation: Model.HasManyRelation,
            modelClass: ProjectBidOfferModel,
            join: {
                from: 'projectsTable.id',
                to: 'projectsBidOffersTable.projectId'
            }
        },
        skills: {
            relation: Model.HasManyRelation,
            modelClass: ProjectSkillModel,
            join: {
                from: 'projectsTable.id',
                to: 'projectsSkillsTable.projectId'
            }
        }
    }
}

module.exports = ProjectModel;