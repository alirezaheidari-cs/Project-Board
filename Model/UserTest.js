const Skill = require('../Model/Skill');
const User = require('../Model/User')
const AuthenticationDataAccess = require('../DataAccess/AuthenticationDataAccess')
const PostgresDataAccess = require('../DataAccess/DatabaseDataAccess');
let authenticationDataAccess = new AuthenticationDataAccess(9090);

(async () => {
    authenticationDataAccess.getUserIdWithToken = await jest.fn().mockResolvedValue('user1');
    PostgresDataAccess.getUserWithId = await jest.fn().mockResolvedValue(new User("1", "alireza", "heidari", "back", undefined, [new Skill("HTML", 20)], [], [], [], "nothing", null, []));
})()

describe("test application controller functions", () => {

    it("should get user with given token", async () => {
        let user = await User.getUserWithToken("just for test", authenticationDataAccess);
        expect(user).toEqual(new User("1", "alireza", "heidari", "back", undefined, [new Skill("HTML", 20)], [], [], [], "nothing", null, []));
    });


});