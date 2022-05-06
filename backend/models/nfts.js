var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const FolderSchema = Schema({
    folderID: {
        type: String,
        required: true,
        lowercase: true
    },
    tokenID: {
        type: Number,
        required: true
    },
    metadata: {
        type: String,
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