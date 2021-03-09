const ApplicationController = require('../Model/ApplicationController');
const Skill = require('../Model/Skill');
const User = require('../Model/User.js');
const BidOffer = require('../Model/BidOffer');
const Project = require('../Model/Project');
const Endorsement = require('../Model/Endorsement')
let applicationController = new ApplicationController();

const skill = new Skill("HTML", 20);
let user2 = new User("2", "hamid", "yaghoobi", "AI", undefined, [skill], [], [], [], "nothing", null, []);
let user1 = new User("1", "alireza", "heidari", "back", undefined, [skill], [], [], [], "nothing", null, []);
let project = new Project("project1", "", [new Skill("HTML", 20)], 10, '2', [new BidOffer("1", 'project1', 3)], "", 2931049132, null, "", true);

describe("test application controller functions", () => {
    beforeEach(() => {
        user1 = new User("1", "alireza", "heidari", "back", undefined, [skill], [], [], [], "nothing", null, []);
        user2 = new User("2", "hamid", "yaghoobi", "AI", undefined, [skill], [], [], [], "nothing", null, []);
        project = new Project("project1", "", [new Skill("HTML", 20)], 10, '2', [new BidOffer("1", 'project1', 3)], "", 2931049132, null, "", true);
        jest.restoreAllMocks()
    })
    it("should check user has required skills and return true", async () => {
        User.getUserWithId = await jest.fn().mockResolvedValue(user1);
        user1.getSkills = await jest.fn().mockResolvedValue([skill])
        let flag = await applicationController.userHasRequiredSkillsForProject("1", [skill])
        expect(flag).toBe(true)
    });

    it("should check user has required skills and return false", async () => {
        User.getUserWithId = await jest.fn().mockResolvedValue(user1);
        user1.getSkills = await jest.fn().mockResolvedValue([skill])
        let flag = await applicationController.userHasRequiredSkillsForProject("1", [new Skill('HTML', 30)])
        expect(flag).toBe(false)
    });

    it("should endorse a user Skill", async () => {
        let endorsedUser = user2;
        let endorserUser = user1;
        User.getUserWithId = await jest.fn().mockResolvedValue(endorsedUser);
        endorserUser.isThisUserEndorsedThisSkillForThisUser = await jest.fn().mockResolvedValue(false);
        endorsedUser.isThisUserHasThisSkill = await jest.fn().mockResolvedValue(true);
        User.getUserWithToken = await jest.fn().mockResolvedValue(endorserUser);

        endorserUser.addToEndorsedOtherUsersSkillsList = await jest.fn().mockImplementation(() => {
            endorserUser.endorsedOtherUsersSkillsList.push(new Endorsement('2', '1', "HTML"));
        });

        endorsedUser.increaseSkillPoints = await jest.fn().mockImplementation(() => {
            endorsedUser.skills[0] = new Skill("HTML", 21);
        });

        await applicationController.endorseSkill({endorserUserId: "2", skillName: "HTML", token: ""});
        expect(endorsedUser.skills).toEqual([new Skill("HTML", 21)]);
        expect(endorserUser.endorsedOtherUsersSkillsList).toEqual([new Endorsement('2', '1', 'HTML')])
    })

    it("should remove a single skill", async () => {
        let user = user1
        let endorserUser = user2;
        endorserUser.endorsedOtherUsersSkillsList.push(new Endorsement('1', '2', "HTML"))
        User.getUserWithToken = await jest.fn().mockResolvedValue(user);
        user.isThisUserHasThisSkill = await jest.fn().mockResolvedValue(true);
        jest.spyOn(applicationController , 'checkUserBidNeedThisSkill').mockResolvedValue(false)

        // applicationController.checkUserBidNeedThisSkill = await jest.fn().mockResolvedValue();

        applicationController.setNewSkillsAfterRemovingASkill = await jest.fn().mockImplementation(() => {
            user.skills = user.skills.filter(skill => {
                if (!(skill.skillName === "HTML" && skill.points === 20))
                    return skill
            });
        });
        applicationController.setNewEndorseListAfterRemoveASkill = await jest.fn().mockImplementation(() => {
            endorserUser.endorsedOtherUsersSkillsList = [];
        });
        await applicationController.removeSkill({skillName: "HTML", token: "token"});
        expect(user.skills).toEqual([])
        expect(endorserUser.endorsedOtherUsersSkillsList).toEqual([])
    });

    it("should add a single skill", async () => {
        User.getUserWithToken = await jest.fn().mockResolvedValue(user1);
        applicationController.isThisSkillInSkillsSet = await jest.fn(() => true)
        user1.isThisUserHasThisSkill = await jest.fn().mockResolvedValue(false);
        user1.addSkill = await jest.fn().mockImplementation(() => {
            user1.skills.push(new Skill("CSS", 30));
        });
        await applicationController.addSkill("CSS");
        expect(user1.skills).toEqual([skill, new Skill("CSS", 30)]);
    });

    it("should check user bid need this skill", async () => {
        Project.getAllProjects = await jest.fn().mockResolvedValue([project]);
        let flag = await applicationController.checkUserBidNeedThisSkill(user1, "HTML");
        expect(flag).toBe(true);
        project.bidOffers = [];
        flag = await applicationController.checkUserBidNeedThisSkill(user1, "HTML");
        expect(flag).toBe(false);
    });

});


