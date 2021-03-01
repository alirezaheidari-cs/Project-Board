module.exports = {
    development: {
        client: 'sqlite3',
        connection: '/home/tapsi/Tapsi/project1_joboonja/final/DataAccess/database.db',
        migrations: {
            directory: '/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/migrations'
        },
        seeds: {
            directory:'/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/seeds'
        }
    }
}