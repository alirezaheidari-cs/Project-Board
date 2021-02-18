const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
let db
(async () => {
    // open the database
     db = await sqlite.open({
        filename: 'database.db',
        driver: sqlite3.Database
    })
    // await db.exec('CREATE TABLE userTable (id , username, age)');
    // await db.run('INSERT INTO userTable VALUES  (?,?,?)', [1, "reza", 9]);
    // await db.run('INSERT INTO userTable VALUES  (?,?,?)', [2, "yasi", 19]);
    // await db.run('INSERT INTO userTable VALUES  (?,?,?)', [3, "hamid", 39]);
    // let result =await db.all('SELECT * FROM user');

    // let result = await db.get('SELECT *  FROM userTable WHERE id = 333');
    // console.log(result)

    // let result = await db.run('DELETE * FROM userTable WHERE id = ?' , 1)
    // await db.run('INSERT INTO user (id ,user , name ,age ) VALUES  (? , ?  ,? , ?)', [4, "sadf", "fqwe", 30]);

    // console.log(result)
    // const result = await db.run('UPDATE userTable SET id = ? , username = ? , age = ?  WHERE username = ?',
    //     [11 , "hos" , 3000 , "yasi"]);
    // // console.log(result)
    console.log(await db.all('SELECT * FROM userTable'));

})();