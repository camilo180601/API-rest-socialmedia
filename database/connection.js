const mongoose = require('mongoose');

const connection = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/my_socialmedia");

        console.log("¡¡Connected successfully!!")

    } catch (err) {
        console.log(err);
        throw new Error("Failed to connect to the database")
    }
}

module.exports = connection;