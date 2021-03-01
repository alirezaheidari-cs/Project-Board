exports.up = function (knex) {
    return knex.schema.createTableIfNotExists('usersTable', function (table) {
        table.string('id').primary();
        table.string('firstName');
        table.string('lastName');
        table.string('jobTitle');
        table.string('bio');
        table.string('profilePictureURL');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('usersTable');
};
