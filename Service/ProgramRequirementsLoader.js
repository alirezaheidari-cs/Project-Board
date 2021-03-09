(async () => {
    await require('../Model/ApplicationController').runDataAccessClasses();
    const PostgresDataAccess = require('../DataAccess/PostgresDataAccess');
        let allU = await PostgresDataAccess.getAllUsers();
        let allP = await PostgresDataAccess.getAllProjects();
        console.log(JSON.stringify(allU));
        console.log(JSON.stringify(allP));
})()
