const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('../services/jwt');
const mongoosePagination = require('mongoose-pagination');
const followService = require('../services/followService');
const Publication = require('../models/Publication');
const validate = require('../helpers/validate');
const Follow = require('../models/Follow');
const User = require('../models/User');

const register = (req, res) => {

    let params = req.body;

    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Incomplete data"
        });
    }

    try {
        validate(params);   
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion no superada"
        });
    }

    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }

        ]
    }).exec()
        .then(async (users) => {
            if (users && users.length >= 1) {
                return res.status(200).json({
                    status: "success",
                    message: "User already exists"
                });
            }

            const hash = await bcrypt.hash(params.password, 10);
            params.password = hash;

            let user_new = new User(params);

            user_new.save()
                .then((userStored) => {
                    return res.status(200).json({
                        status: "success",
                        message: "Successfully registered user",
                        user: {
                            id: userStored._id,
                            nick: userStored.nick,
                            name: userStored.name,
                            surname: userStored.surname,
                            created_at: userStored.created_at
                        }
                    });
                })
                .catch((error) => {
                    return res.status(500).send({
                        status: "error",
                        message: "Error saving user"
                    })
                });

        })
        .catch((error) => {
            return res.status(500).json({
                status: "error",
                message: "Error in the query"
            })
        })
}

const login = (req, res) => {

    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Incomplete data"
        })
    }

    User.findOne({ email: params.email })
        .then((user) => {

            const verify = bcrypt.compareSync(params.password, user.password);

            if (!verify) {
                return res.status(400).json({
                    status: "error",
                    message: "Incorrect credentials"
                })
            }

            const token = jwt.createToken(user);

            return res.status(200).json({
                status: "success",
                message: "You have successfully logged in",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick,
                    email: user.email
                },
                token
            });
        })
        .catch((error) => {
            return res.status(404).json({
                status: "error",
                message: "Error user not found"
            });
        })

}

const profile = (req, res) => {

    const id = req.params.id;

    User.findOne({ _id: id })
        .select({ password: 0, role: 0 })
        .then(async(userProfile) => {

            const followInfo = await followService.followthisUser(req.user.id, userProfile._id)

            return res.status(200).json({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            });
        })
        .catch((error) => {
            return res.status(404).json({
                status: "error",
                message: "Error user not found"
            });
        })

}

const list = async (req, res) => {

    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    let itemsPerPage = 10;

    const total = await User.countDocuments();

    User.find().select("-password -email -role -__v").sort('_id').paginate(page, itemsPerPage)
        .then(async(users) => {

            let followUserId = await followService.followUserId(req.user.id);

            return res.status(200).json({
                status: "success",
                users,
                page,
                itemsPerPage,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserId.following,
                user_follow_me: followUserId.followers
            });
        })
        .catch(error => {
            return res.status(404).json({
                status: "error",
                message: "No users available"
            });
        });
}

const update = (req, res) => {

    let userIdentity = req.user;
    let userUpdate = req.body;

    delete userIdentity.iat;
    delete userIdentity.exp;
    delete userIdentity.role;
    delete userIdentity.image;

    User.find({
        $or: [
            { email: userUpdate.email.toLowerCase() },
            { nick: userUpdate.nick.toLowerCase() }

        ]
    }).exec()
        .then(async (users) => {

            let userIsset = false;

            users.forEach(user => {
                if (user && user._id != userIdentity.id) {
                    userIsset = true;
                }
            });

            if (userIsset) {
                return res.status(200).send({
                    status: "success",
                    message: "User already exists"
                })
            }

            if (userUpdate.password) {
                const hash = await bcrypt.hash(userUpdate.password, 10);
                userUpdate.password = hash;
            } else {
                delete userUpdate.password;
            }

            try {
                let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userUpdate, { new: true });

                if (!userUpdated) {
                    return res.status(400).json({
                        status: "error",
                        message: "Failed to update user"
                    });
                }

                return res.status(200).json({
                    status: "success",
                    message: "Update user method",
                    user: userUpdated
                });

            } catch (error) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to update user"
                });
            };

        })
        .catch((error) => {
            return res.status(500).json({
                status: "error",
                message: "Error in the query"
            });
        });
}

const upload = (req, res) => {

    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "Not found image"
        });
    }

    let image     = req.file.originalname;
    let extension = image.split('\.');
    extension = extension[1];

    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){

        const filepath = req.file.path;
        const fileDeleted = fs.unlinkSync(filepath);

        return res.status(400).send({
            status: "error",
            message: "Invalid file extension"
        });    
    }

    User.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true})
        .then((userUpdated) => {
            return res.status(200).send({
                status: "success",
                user: userUpdated,
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

const avatar = (req, res) => {

    const file = req.params.file;

    const filepath = "./uploads/avatars/"+file;

    fs.stat(filepath, (error, exists) => {
        if(!exists){
            return res.status(404).send({
                status: "error",
                message: "No exists image"
            });
        }
        return res.sendFile(path.resolve(filepath));
    })
}

const counters = async(req, res) => {

    let user_id = req.user.id;

    if(req.params.id){
        user_id = req.params.id;
    }

    try {
        const following = await Follow.countDocuments({"user": user_id});

        const followed = await Follow.countDocuments({"followed": user_id});

        const publications = await Publication.countDocuments({"user": user_id});

        return res.status(200).send({
            status: "success",
            user_id,
            following,
            followed,
            publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error in the counters",
        });
    }
}

module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}