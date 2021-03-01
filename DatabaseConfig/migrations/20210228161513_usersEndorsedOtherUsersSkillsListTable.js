exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('usersEndorsedOtherUsersSkillsListTable', function (table) {
        table.increments('id').primary();
        table.string('userId');
        table.string('endorsedUserId');
        table.string('skillName');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('usersEndorsedOtherUsersSkillsListTable');
};
