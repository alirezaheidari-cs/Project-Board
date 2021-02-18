const Project = require('../Model/Project.js');

let project1 = new Project(1, "project1", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user1", [{biddingUser: "user3", projectId: 1, bidAmount: 1}, {
    biddingUser: "user4",
    projectId: 1,
    bidAmount: 1
}], "goood", 1633811400000, "user3", "asfaa", false);
let project2 = new Project(2, "project2", [{name: "HTML", points: 10}, {
    name: "CSS",
    points: 20
}], 10, "user2", [], "goood", 1633811400000, undefined, "asfaa", true);

describe("test ./Model/Project", () => {

    test("get project with id (or being active condition) from allProjects", () => {
        Project.allProjects = [project1, project2];
        let project = Project.getProjectWithProjectId("project2");
        expect(project).toBeFalsy();
        project = Project.getProjectWithProjectId(1);
        expect(project).toEqual(project1);
        project = Project.getProjectWithProjectIdWithActive(1, true);
        expect(project).toBeFalsy();
        project = Project.getProjectWithProjectIdWithActive(2, true);
        expect(project).toEqual(project2);
    });

    test("is there any projects in allProjects with id (or being active condition)", () => {
        Project.allProjects = [project1, project2];
        let flag = Project.isThereAnyProjectsWithId("22");
        expect(flag).toBe(false);
        flag = Project.isThereAnyProjectsWithId(2);
        expect(flag).toBe(true);
        flag = Project.isThereAnyProjectsWithIdWithActive(1, true);
        expect(flag).toBe(false);
        flag = Project.isThereAnyProjectsWithIdWithActive(1, false);
        expect(flag).toBe(true);
    });

    test("add project to allProjects", () => {
        Project.allProjects = [project1];
        Project.addProject(project2);
        expect(Project.allProjects[1]).toEqual(project2);
        expect(Project.allProjects.length).toBe(2);
    });

    test("is user submitted a bid for a project", () => {
        let flag = project1.isThisUserIdSubmittedABid("user3");
        expect(flag).toBe(true);
        flag = project1.isThisUserIdSubmittedABid("2");
        expect(flag).toBe(false);

    });
});