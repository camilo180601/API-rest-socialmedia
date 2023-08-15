const Follow = require('../models/Follow');

const followUserId = async (identityUserId) => {
    try {
        let following = await Follow.find({ "user": identityUserId })
            .select({ "_id": 0, "followed": 1 })
            .exec();

        let followers = await Follow.find({ "followed": identityUserId })
            .select({ "_id": 0, "user": 1 })
            .exec();

        let followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed);
        });

        let followersClean = [];

        followers.forEach(follow => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        }
    } catch (error) {
        return {};
    }

}

const followthisUser = async (identityUserId, profileUserid) => {
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserid })

    let follower = await Follow.findOne({ "user": profileUserid, "followed": identityUserId })

    return {
        following,
        follower
    };
}

module.exports = {
    followUserId,
    followthisUser
}