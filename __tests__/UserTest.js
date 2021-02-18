const User = require('../Model/User.js');
let user1 = new User();
let user2 = new User();

user1.setUserInformation("user1", "amin", "davood", "AI", [{name: "HTML", points: 60}, {
    name: "CSS",
    points: 60
}], [], [], [1], "soccer player", "gppg", []);
user2.setUserInformation("user2", "amidsn", "davood", "AI", [{name: "HTML", points: 60}, {
    name: "CSS",
    points: 60
}], [], [], [1], "soccer player", "gppg", []);

describe("test ./Model/User", () => {

    test("add 2 users to allUsers with initialAllUsers function", () => {
        User.initialAllUsers([user1, user2]);
        expect(User.allUsers.length).toBe(2);
        User.allUsers = [];
    });

    test("add a user to allUsers", () => {
        User.AllUsers = [];
        User.addUser(user1);
        expect(User.allUsers.length).toBe(1);
    });

    test("get user with id", () => {
        User.initialAllUsers([user1, user2]);
        let user = User.getUserWithId("user1");
        expect(user).toEqual(user1);
        expect(User.getUserWithId("user12")).toBeFalsy();
        User.allUsers = [];
    });

    test("remove a project for a user", () => {
        user1.activeProjectsIds = [1, 2];
        user1.inactiveProjectsIds = [];
        user1.removeProject(1);
        expect(user1.activeProjectsIds).toEqual([2]);
        expect(user1.inactiveProjectsIds).toEqual([1]);
    });

    test("is this user endorsed this skill for this user", () => {
        user1.endorsedOtherUsersSkillsList = [{id: "user2", skillName: "HTML"}];
        expect(user1.isThisUserEndorsedThisSkillForThisUser("HTML", user2)).toBe(true);
        expect(user1.isThisUserEndorsedThisSkillForThisUser("JAVA", user2)).toBe(false);
    });

    test("is this user has this skill", () => {
        expect(user1.isThisUserHasThisSkill("HTML")).toBe(true);
        expect(user1.isThisUserEndorsedThisSkillForThisUser("JAVA", user2)).toBe(false);
    });

    test("increase user skill points", () => {
        expect(user1.skills[0].points).toBe(60);
        user1.increaseSkillPoints("HTML");
        expect(user1.skills[0].points).toBe(61);
    });

    test("add skill to user skills", () => {
        expect(user1.skills.length).toBe(2);
        user1.addSkill({name: "C++", points: 30});
        expect(user1.skills.length).toBe(3);
        expect(user1.skills[2]).toEqual({name: "C++", points: 30});
    });
});
