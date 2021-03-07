module.exports = {
    development: {
        client: 'postgres',
        connection: {
            host: 'localhost',
            user: 'postgres',
            port: 9090,
            password: 'password',
            database: 'database',
            charset: 'utf8'
        },
        migrations: {
            directory: '/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/migrations'
        },
        seeds: {
            directory: '/home/tapsi/Tapsi/project1_joboonja/final/DatabaseConfig/seeds'
        },
        useNullAsDefault: true
    }
}