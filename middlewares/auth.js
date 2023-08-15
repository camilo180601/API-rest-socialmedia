const jwt = require('jwt-simple');
const moment = require('moment');

const lib_jwt = require('../services/jwt');
const key = lib_jwt.key;

//Middleware auth JWT
exports.auth = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "The request does not have the authentication header"
        });
    }

    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        let payload = jwt.decode(token, key);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "The token expired"
            })
        }

        req.user = payload;

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Invalidate token"
        })
    }

    next();

}