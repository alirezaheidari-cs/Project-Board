class Endorsement {
    constructor(endorsedUserId, endorserUserId, skillName) {
        this.endorsedUserId = endorsedUserId;
        this.endorserUserId = endorserUserId;
        this.skillName = skillName;
    }

    getEndorserUserId() {
        return this.endorserUserId;
    }

    getEndorsedUserId() {
        return this.endorsedUserId;
    }

    getSkillName() {
        return this.skillName;
    }

    setEndorserUserId(endorserUserId) {
        this.endorserUserId = endorserUserId;
    }

    setEndorsedUserId(endorsedUserId) {
        this.endorsedUserId = endorsedUserId;
    }

    setSkillName(skillName) {
        this.skillName = skillName;
    }


}

module.exports = Endorsement;