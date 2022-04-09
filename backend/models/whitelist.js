var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const Whitelist = Schema({
    user: {
        type: String
    },
    folderID: {
        type: String
    },
    timestamps: true
});

module.exports = Mongoose.model('Whitelist', Whitelist);