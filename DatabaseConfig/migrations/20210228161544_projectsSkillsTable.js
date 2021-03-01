exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('projectsSkillsTable', function (table) {
        table.increments('id').primary();
        table.string('projectId');
        table.string('skillName');
        table.bigInteger('points');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('projectsSkillsTable');
};
