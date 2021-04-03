exports.up = function (knex) {
    return knex.schema. createTableIfNotExists('usersTable', function (table) {
        table.increments('_id').primary()
        table.string('id');
        table.string('firstName');
        table.string('lastName');
        table.string('jobTitle');
        table.string('bio');
        table.string('profilePictureURL');
        table.unique(['id']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('usersTable');
};
