const { Schema, model } = require('mongoose');

const LikeSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    publication: {
        type: Schema.ObjectId,
        ref: "Publication"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Like", LikeSchema, "likes");