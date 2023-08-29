const Follow = require('../models/Follow');
const mongoosePagination = require('mongoose-pagination');
const followService = require('../services/followService');

const save = (req, res) => {

    const params = req.body;

    const identity = req.user;

    let userFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    userFollow.save()
        .then((followStored) => {
            return res.status(200).send({
                status: "success",
                identity: req.user,
                follow: followStored
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Could not follow user"
            });
        })
}

const unfollow = (req, res) => {

    const identity = req.user;

    const params = req.params;

    Follow.findOneAndRemove({
        "user": identity.id,
        "followed": params.id
    })
    .then((followedDeleted) => {
        if (followedDeleted) {
            return res.status(200).send({
                status: "success",
                message: "Follow deleted"
            });
        } else {
            return res.status(404).send({
                status: "error",
                message: "Follow not found"
            });
        }
    })
    .catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "Error follow not deleted"
        });
    });
}

const following = async(req, res) => {

    let user_id = req.user.id;

    if(req.params.id){
        user_id = req.params.id; 
    }

    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    const itemsPerPage = 10;

    const total = await Follow.countDocuments({user: user_id});

    Follow.find({user: user_id})
        .populate("user followed", "-password -role -__v -email")
        .paginate(page, itemsPerPage)
        .then(async(following) => {

            let followUserId = await followService.followUserId(user_id);

            return res.status(200).send({
                status: "success",
                message: "List of users that I follow",
                following,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserId.following,
                user_follow_me: followUserId.followers
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error get following"
            });
        });
}

const followers = async(req, res) => {
    let user_id = req.user.id;

    if(req.params.id){
        user_id = req.params.id; 
    }

    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    const itemsPerPage = 10;

    const total = await Follow.countDocuments({followed: user_id});

    Follow.find({followed: user_id})
        .populate("user followed", "-password -role -__v -email")
        .paginate(page, itemsPerPage)
        .then(async(followers) => {

            let followUserId = await followService.followUserId(user_id);

            return res.status(200).send({
                status: "success",
                message: "List of users who follow me",
                followers,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserId.following,
                user_follow_me: followUserId.followers
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error get followers"
            });
        });
}

module.exports = {
    save,
    unfollow,
    following,
    followers
}