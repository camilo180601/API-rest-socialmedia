const Like = require('../models/Like');
const likeService = require('../services/likeService');

const save = (req, res) => {

    let publicationId = req.body.publication;
    let userId = req.user.id;

    let like = new Like();
    like.user = userId;
    like.publication = publicationId;

    like.save()
        .then((likeSaved) => {
            return res.status(200).send({
                status: "success",
                like: likeSaved
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Didn't like"
            });
        });
}

const remove = (req, res) => {

    let publicationId = req.params.id;
    let userId = req.user.id;

    Like.find({ "user": userId, "publication": publicationId }).deleteOne()
        .then((likeDeleted) => {
            return res.status(200).send({
                status: "success",
                message: "Like deleted",
                like: likeDeleted
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Like not deleted"
            });
        })
}

const list = async (req, res) => {

    let user_id = req.user.id;
    let page = 1;

    if (req.params.id) {
        user_id = req.params.id;
    }

    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 10;

    const myLikes = await likeService.likeUserid(req.user.id);

    const total = await Like.countDocuments({ user: user_id });

    try {
        Like.find({ user: user_id })
            .populate({
                path: "publication",
                select: "-__v",
                populate: {
                    path: "user",
                    select: "name nick surname image", // Selecciona los campos que deseas del usuario
                }
            })
            .sort("-created_at")
            .paginate(page, itemsPerPage)
            .then((publicationsLikes) => {
                return res.status(200).send({
                    status: "success",
                    message: "Publications Liked",
                    total,
                    page,
                    pages: Math.ceil(total / itemsPerPage),
                    publicationsLikes,
                    likes: myLikes.likes
                });
            })
            .catch((error) => {
                return res.status(500).send({
                    status: "error",
                    message: "No publications liked"
                });
            });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No publications liked"
        });
    }
}

const counter = async (req, res) => {

    try {
        const publicationId = req.params.id;

        const total = await Like.countDocuments({ publication: publicationId });

        return res.status(200).send({
            status: "success",
            total
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error count likes"
        });
    }
}

module.exports = {
    save,
    remove,
    list,
    counter
}