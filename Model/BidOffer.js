class BidOffer{
    constructor(biddingUser , projectId , bidAmount) {
        this.biddingUser = biddingUser;
        this.projectId = projectId;
        this.bidAmount = bidAmount;
    }


    getBiddingUser() {
        return this.biddingUser;
    }

    setBiddingUser(value) {
        this.biddingUser = value;
    }

    getProjectId() {
        return this.projectId;
    }

    setProjectId(value) {
        this.projectId = value;
    }

    getBidAmount() {
        return this.bidAmount;
    }

    setBidAmount(value) {
        this.bidAmount = value;
    }
}

module.exports = BidOffer;