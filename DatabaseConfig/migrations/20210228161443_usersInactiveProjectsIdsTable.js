exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('usersInactiveProjectsIdsTable', function (table) {
        table.increments('id').primary();
        table.string('userId');
        table.string('projectId');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('usersInactiveProjectsIdsTable');
};
