const Application = require('../Service/Application.js');
const Project = require('../Model/Project.js');
const User = require('../Model/User.js');
const Server = require('../Server/Server.js');

let user1 = new User();
let user2 = new User();
let user3 = new User();
let user4 = new User();

user1.setUserInformation("user1", "amin", "davood", "AI", [{name: "HTML", points: 60}, {
    name: "CSS",
    points: 60
}], [], [], [1], "soccer player", "gppg", []);
user2.setUserInformation("user2", "amidsn", "davood", "AI", [{name: "HTML", points: 60}, {
    name: "CSS",
    points: 60
}], [2], [], [1], "soccer player", "gppg", []);
user3.setUserInformation("user3", "amidsn", "davood", "AI", [{
    name: "CSS",
    points: 60
}], [], [], [], "soccer player", "gppg", []);
user4.setUserInformation("user4", "amin", "davood", "AI", [{name: "HTML", points: 20}, {
    name: "CSS",
    points: 40
}], [], [], [1], "soccer player", "gppg", []);

let project1 = new Project(1, "project1", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user1", [], "goood", 1633811400000, "user2", "asfaa", false);
let project2 = new Project(2, "project2", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user1", [], "goood", 1933811400000, undefined, "asfaa", true);
let project3 = new Project(3, "project3", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user2", [], "goood", 1933811400000, undefined, "asfaa", true);
let project4 = new Project(4, "project4", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user2", [], "goood", 33811400000, undefined, "asfaa", true);
let project5 = new Project(5, "project5", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user1", [], "goood", 1933811400000, undefined, "asfaa", true);

function restartUsersAndProjectsInformation() {
    user1.setUserInformation("user1", "amin", "davood", "AI", [{name: "HTML", points: 60}, {
        name: "CSS",
        points: 60
    }], [], [], [1], "soccer player", "gppg", []);
    user2.setUserInformation("user2", "amidsn", "davood", "AI", [{name: "HTML", points: 60}, {
        name: "CSS",
        points: 60
    }], [2], [], [1], "soccer player", "gppg", []);
    user3.setUserInformation("user3", "amidsn", "davood", "AI", [{
        name: "CSS",
        points: 60
    }], [], [], [], "soccer player", "gppg", []);
    user4.setUserInformation("user4", "amin", "davood", "AI", [{name: "HTML", points: 20}, {
        name: "CSS",
        points: 40
    }], [], [], [1], "soccer player", "gppg", []);
    project1.setProjectInformation(1, "project1", [{name: "HTML", points: 10}, {
        name: "CSS",
        points: 20
    }], 10, "user1", [], "goood", 1633811400000, "user2", "asfaa", false);
    project2.setProjectInformation(2, "project2", [{name: "HTML", points: 10}, {
        name: "CSS",
        points: 20
    }], 10, "user1", [], "goood", 1933811400000, undefined, "asfaa", true);
    project3.setProjectInformation(3, "project3", [{name: "HTML", points: 10}, {
        name: "CSS",
        points: 20
    }], 10, "user2", [], "goood", 1933811400000, undefined, "asfaa", true);
    project4.setProjectInformation(4, "project4", [{name: "HTML", points: 10}, {
        name: "CSS",
        points: 20
    }], 10, "user2", [], "goood", 33811400000, undefined, "asfaa", true);
    project5.setProjectInformation(5, "project5", [{name: "HTML", points: 10}, {
        name: "CSS",
        points: 20
    }], 10, "user1", [], "goood", 1933811400000, undefined, "asfaa", true);
}

// let server = new Server(3000);

describe("test ./User/Application.js", () => {

    beforeEach(() => {
        restartUsersAndProjectsInformation();
    })

    test("import users and projects data from database", async () => {
        Project.allProjects = [];
        User.allUsers = [];
        await Application.importProjectsAndUsersDataFromDatabase('./__tests__/UsersTest.json', './__tests__/ProjectsTest.json');
        expect(Project.allProjects.length).toBe(1);
        expect(User.allUsers.length).toBe(1);
        expect(Project.allProjects[0].getId()).toBe(11);
        expect(User.allUsers[0].getId()).toBe("user2");
    });

    test("deactivate active projects if deadline passed", () => {
        User.allUsers = [user1, user2];
        Project.allProjects = [project1, project2, project4];
        Application.checkProjectsDeadlinesPassed();
        expect(project4.getIsActive()).toBe(false);
        expect(project3.getIsActive()).toBe(true);
    });

    test("register or login a user ", () => {
        User.allUsers = [user1];
        expect(Application.handleRegisterUser({
            id: "user2",
            firstName: "hamid",
            lastName: "yaghobi",
            jobTitle: "AI",
            skills: [{name: "CSS", points: 50}],
            bio: "olympiad",
            profilePictureURL: "gog"
        })).toBe("registration successful");
        expect(Application.handleRegisterUser({
            id: "user2",
            firstName: "hamid",
            lastName: "yaghobi",
            jobTitle: "AI",
            skills: [{name: "CSS", points: 50}],
            bio: "olympiad",
            profilePictureURL: "gog"
        })).toBe("login successful");
    });

    test("logout a user", () => {
        User.allUsers = [user1, user2];
        Application.loggedInUser = user1;
        expect(Application.handleLogout()).toBe("logged out successfully");
        expect(Application.loggedInUser).toBeFalsy();
    });

    test("add a project ", () => {
        User.allUsers = [user1, user2];
        Project.allProjects = [];
        Application.loggedInUser = user1;
        expect(Application.handleAddProject({
            id: 1,
            title: "project1",
            skills: [{name: "HTML", points: 10}, {name: "CSS", points: 20}],
            budget: 10,
            description: "goood",
            deadline: "2021/10/10",
            imageURL: "asfaa"
        })).toBe("project added successfully");
        expect(Application.handleAddProject({
            id: 1,
            title: "project1",
            skills: [{name: "HTML", points: 10}, {name: "CSS", points: 20}],
            budget: 10,
            description: "goood",
            deadline: "2021/10/10",
            imageURL: "asfaa"
        })).toBe("there is a project with this id");
        expect(Project.allProjects.length).toBe(1);
        expect(user1.activeProjectsIds.length).toBe(1);
    });

    test("user has required skills for a project", () => {
        User.allUsers = [user1, user2];
        Application.loggedInUser = user1;
        expect(Application.userHasRequiredSkillsForProject([{name: "HTTP", points: 10}, {
            name: "CSW",
            points: 10
        }])).toBe(false);
        expect(Application.userHasRequiredSkillsForProject([{name: "HTML", points: 10}])).toBe(true);
    });

    test("bid for a project", () => {
        User.allUsers = [user1, user2, user3];
        Project.allProjects = [project1, project2, project3];
        Application.loggedInUser = user2;
        expect(Application.handleBid({
            biddingUser: "user3",
            projectId: 1,
            bidAmount: 1
        })).toBe("you can't bid for someone else");
        expect(Application.handleBid({
            biddingUser: "user2",
            projectId: 3243,
            bidAmount: 1
        })).toBe("there is not any projects with this Id");
        expect(Application.handleBid({
            biddingUser: "user2",
            projectId: 1,
            bidAmount: 1
        })).toBe("project has been expired");
        expect(Application.handleBid({
            biddingUser: "user2",
            projectId: 3,
            bidAmount: 1
        })).toBe("you can't bid your own project");
        expect(Application.handleBid({
            biddingUser: "user2",
            projectId: 2,
            bidAmount: 1000
        })).toBe("your bidding budget is greater than projects budget");
        Application.loggedInUser = user3;
        expect(Application.handleBid({
            biddingUser: "user3",
            projectId: 2,
            bidAmount: 1
        })).toBe("you don't have enough skills for this project");
        Application.loggedInUser = user1;
        expect(Application.handleBid({
            biddingUser: "user1",
            projectId: 3,
            bidAmount: 1
        })).toBe("your request submitted");
        expect(Application.handleBid({
            biddingUser: "user1",
            projectId: 3,
            bidAmount: 1
        })).toBe("you cannot submit a bid more than once");
        expect(project3.getBidOffers()).toEqual([{biddingUser: "user1", projectId: 3, bidAmount: 1}]);
    });

    test("compute points for bidder", () => {
        User.allUsers = [user1, user2, user3];
        Project.allProjects = [project1, project2, project3, project4];
        project3.bidOffers = [{
            biddingUser: "user1",
            projectId: 3,
            bidAmount: 1
        }];
        expect(Application.computePointForBidder(user1, project3, 1)).toBe(410000009);
    });

    test("compute auction winner for a project", () => {
        User.allUsers = [user1, user2, user3, user4];
        Project.allProjects = [project3];
        project3.bidOffers = [{
            biddingUser: "user1",
            projectId: 3,
            bidAmount: 1
        }, {
            biddingUser: "user4",
            projectId: 3,
            bidAmount: 1
        }];
        expect(Application.computeAuctionWinner(3)).toBe("user1 wins! for project with id: 3");
        project3.bidOffers = [{
            biddingUser: "user4",
            projectId: 3,
            bidAmount: 1
        }];
        project3.isActive = true;
        expect(Application.computeAuctionWinner(3)).toBe("user4 wins! for project with id: 3");

    });

    test("submit auction", () => {
        User.allUsers = [user1, user2, user3, user4];
        Project.allProjects = [project1, project2, project3, project4];
        Application.loggedInUser = user1;
        expect(Application.handleAuction({projectId: 132})).toBe("there is not any projects with this id");
        expect(Application.handleAuction({projectId: 3})).toBe("you can not auction a project which you are not its owner");
        Application.loggedInUser = user2;
        expect(Application.handleAuction({projectId: 3})).toBe("no one wins for project for id: 3");
    });

    test("endorse a user skill", () => {
        User.allUsers = [user1, user2, user3, user4];
        Application.loggedInUser = user1;
        expect(Application.handleEndorseAUserSkill({
            id: "usersd4",
            skillName: "HTML"
        })).toBe("there is not any users with this id");
        expect(Application.handleEndorseAUserSkill({
            id: "user1",
            skillName: "HTML"
        })).toBe("you can not endorse your own skill");
        expect(Application.handleEndorseAUserSkill({
            id: "user3",
            skillName: "JAVASCRIPT"
        })).toBe("user don't have this skill");
        expect(Application.handleEndorseAUserSkill({id: "user3", skillName: "CSS"})).toBe("endorsed successfully");
        expect(Application.handleEndorseAUserSkill({
            id: "user3",
            skillName: "CSS"
        })).toBe("you can not endorse this skill for this user more than once");
        expect(user3.skills[0].points).toBe(61);
    });

    test("see all users information ", () => {
        User.allUsers = [user1, user2, user3, user4];
        Application.loggedInUser = user1;
        expect(Application.handleSeeAllUsersInformation()).toBe("1) user1\n" +
            "2) user2\n" +
            "3) user3\n" +
            "4) user4\n");
    });

    test("remove a skill from user skills", () => {
        User.allUsers = [user1, user2, user3, user4];
        Application.loggedInUser = user4;
        Project.allProjects = [project5];
        user4.addSkill({name: "JAVA", points: 30});
        project5.bidOffers = [{
            biddingUser: "user4",
            projectId: 5,
            bidAmount: 1
        }];
        expect(Application.handleRemoveSkill({name: "PYTHON"})).toBe("you don't have this skill");
        expect(Application.handleRemoveSkill({name: "CSS"})).toBe("you cannot remove this skill because you bid for some project which needed this skill");
        project5.bidOffers = [];
        expect(Application.handleRemoveSkill({name: "CSS"})).toBe("skill removed successfully");
    });

    test("see all available projects information", () => {
        User.allUsers = [user1, user2, user3, user4];
        Project.allProjects = [project1, project2, project3, project4, project5];
        Application.loggedInUser = user3;
        expect(Application.handleSeeAllAvailableProjectsInformation()).toBe("----------------------\n");
    });

    test("add skill to user skills", () => {
        Application.skillsSet = [{name: "HTTP"}, {name: "CSS"}, {name: "JAVA"}, {name: "CPP"}, {name: "C"}, {name: "JS"}];
        Application.loggedInUser = user1;
        expect(Application.handleAddSkill({
            name: "DNKSK",
            points: 10
        })).toBe("there is not any skills in skills set with this name");
        expect(Application.handleAddSkill({
            name: "CSS",
            points: 10
        })).toBe("you already have this skill");
        expect(Application.handleAddSkill({
            name: "HTTP",
            points: 10
        })).toBe("skill added successfully");
    });

    test("test handle ", () => {
    });
});


