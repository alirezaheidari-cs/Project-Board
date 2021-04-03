exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('projectsTable', function (table) {
        table.increments('_id').primary();
        table.string('id');
        table.string('title');
        table.bigInteger('budget');
        table.string('ownerId');
        table.string('description');
        table.bigInteger('deadline');
        table.string('winnerId');
        table.string('imageURL');
        table.boolean('isActive');
        table.unique(['id']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('projectsTable');
};
