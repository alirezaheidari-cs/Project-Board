const {Model} = require('objection')
const knex = require('../../DatabaseConfig/knex');
const ProjectModel = require('./ProjectModel');
Model.knex(knex);

class ProjectBidOfferModel extends Model {
    static  tableName = "projectsBidOffersTable";

    static get modifiers() {
        return {
            defaultSelects(builder) {
                builder.select('biddingUser', 'projectId' , 'bidAmount');
            }
        };
    }

    static relationMappings = {
        projectBidOffers: {
            relation: Model.BelongsToOneRelation,
            modelClass: ProjectModel,
            join: {
                from: 'projectsBidOffersTable.projectId',
                to: 'projectsTable.id'
            }
        }
    }
}

module.exports = ProjectBidOfferModel;