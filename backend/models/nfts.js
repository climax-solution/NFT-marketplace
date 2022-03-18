var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const FolderSchema = Schema({
    folderID: {
        type: String,
        lowercase: true
    },
    tokenID: {
        type: Number
    },
    updated_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('NFTs', FolderSchema);