class Skill {
    constructor(skillName, points) {
        this.skillName = skillName;
        this.points = points;
    }

    getSkillName() {
        return this.skillName;
    }

    setSkillName(skillName) {
        this.skillName = skillName;
    }

    getPoints() {
        return this.points;
    }

    setPoints(points) {
        this.points = points;
    }
}

module.exports = Skill;