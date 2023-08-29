const Like = require("../models/Like");

const likeUserid = async(identityUserId) => {
    try {
        let likes = await Like.find({ "user": identityUserId })
            .select({ "_id": 0, "publication": 1 })
            .exec();
        
        let likesClean = [];

        likes.forEach(like => {
            likesClean.push(like.publication);
        });

        return {
            likes: likesClean
        }

    } catch (error) {
        return {};
    }
}

module.exports = {
    likeUserid
}