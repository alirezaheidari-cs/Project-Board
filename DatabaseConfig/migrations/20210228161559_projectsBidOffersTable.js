exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('projectsBidOffersTable', function (table) {
        table.increments('id').primary();
        table.string('projectId');
        table.string('biddingUser');
        table.bigInteger('bidAmount');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('projectsBidOffersTable');
};
