exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('projectsTable', function (table) {
        table.string('id').primary();
        table.string('title');
        table.bigInteger('budget');
        table.string('ownerId');
        table.string('description');
        table.bigInteger('deadline');
        table.string('winnerId');
        table.string('imageURL');
        table.boolean('isActive');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('projectsTable');
};
