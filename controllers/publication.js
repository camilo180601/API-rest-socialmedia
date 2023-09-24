const followService = require('../services/followService');
const likeService = require('../services/likeService');
const Publication = require('../models/Publication');
const path = require('path');
const fs = require('fs');

const save = (req, res) => {

    try {
        const params = req.body;

        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "You must send a text with the publication"
            });
        }

        let publication = new Publication(params);
        publication.user = req.user.id;

        if(req.params.id){
            publication.publication = req.params.id;
        }

        publication.save()
            .then((publicationStored) => {
                return res.status(200).send({
                    status: "success",
                    message: "Publication saved",
                    publication: publicationStored
                });
            })
            .catch((error) => {
                return res.status(500).send({
                    status: "error",
                    message: "Error at create publication"
                });
            });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error at create publication"
        });
    }
}

const detail = async(req, res) => {

    const id = req.params.id;

    let comments = await Publication.find({publication: id}).sort("-created_at");

    Publication.findById(id)
        .then((publication) => {
            return res.status(200).send({
                status: "success",
                message: "Detail publication",
                publication,
                comments
            });
        })
        .catch((error) => {
            return res.status(404).send({
                status: "error",
                message: "Publication not found"
            });
        });
}

const remove = (req, res) => {

    const id = req.params.id;

    Publication.find({ "user": req.user.id, "_id": id }).deleteOne()
        .then((publicationDeleted) => {
            return res.status(200).send({
                status: "success",
                message: "Publication deleted",
                publication: id
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Publication not deleted"
            });
        });
}

const user = async (req, res) => {

    const userId = req.params.id;

    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemsPerPage = 10;

    const myLikes = await likeService.likeUserid(req.user.id);

    let total = await Publication.countDocuments({ user: userId });

    Publication.find({ "user": userId })
        .sort("-created_at")
        .populate("user", "-password -__v -role -email")
        .paginate(page, itemsPerPage)
        .then((publications) => {
            return res.status(200).send({
                status: "success",
                message: "Publications user",
                page,
                total,
                pages: Math.ceil(total / itemsPerPage),
                publications,
                likes: myLikes.likes
            });
        })
        .catch((error) => {
            return res.status(404).send({
                status: "error",
                message: "Publications not founds"
            });
        });
}

const upload = (req, res) => {

    const publication_id = req.params.id;

    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Not found image"
        });
    }

    let image = req.file.originalname;
    let extension = image.split('\.');
    extension = extension[1];

    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif" && extension != "mp4" && extension != "mov" && extension != "webm") {

        const filepath = req.file.path;
        const fileDeleted = fs.unlinkSync(filepath);

        return res.status(400).send({
            status: "error",
            message: "Invalid file extension"
        });
    }

    Publication.findOneAndUpdate({ "user": req.user.id, "_id": publication_id }, { file: req.file.filename }, { new: true })
        .then((publicationUpdated) => {
            return res.status(200).send({
                status: "success",
                publication: publicationUpdated,
                file: req.file
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "image upload error"
            });
        });
}

const media = (req, res) => {

    const file = req.params.file;

    const filepath = "./uploads/publications/" + file;

    fs.stat(filepath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No exists image"
            });
        }
        return res.sendFile(path.resolve(filepath));
    })
}

const feed = async (req, res) => {

    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 10;

    try {
        const myFollows = await followService.followUserId(req.user.id);

        const myLikes = await likeService.likeUserid(req.user.id);

        const total = await Publication.countDocuments({ user: myFollows.following });

        const publications = Publication.find({ user: myFollows.following })
            .populate("user", "-password -role -__v -email")
            .sort("-created_at")
            .paginate(page, itemsPerPage)
            .then((publications) => {
                return res.status(200).send({
                    status: "success",
                    message: "Feed of publications",
                    following: myFollows.following,
                    likes: myLikes.likes,
                    total,
                    page,
                    pages: Math.ceil(total / itemsPerPage),
                    publications
                });
            })
            .catch((error) => {
                return res.status(500).send({
                    status: "error",
                    message: "No publications to show"
                });
            })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No publications to show"
        });
    }

}

module.exports = {
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}