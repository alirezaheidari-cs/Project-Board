exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('usersSkillsTable', function (table) {
        table.increments('id').primary();
        table.string('userId');
        table.string('skillName');
        table.bigInteger('points');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('usersSkillsTable');
};
