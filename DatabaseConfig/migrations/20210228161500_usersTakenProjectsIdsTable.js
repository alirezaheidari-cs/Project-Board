exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('usersTakenProjectsIdsTable', function (table) {
        table.increments('id').primary();
        table.string('userId');
        table.string('projectId');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('usersTakenProjectsIdsTable');
};
