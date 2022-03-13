var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const FolderSchema = Schema({
    name: {
        type: String
    },
    artist: {
        type: String
    },
    range: {
        type: Array,
        default: []
    },
    updated_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('Folder', FolderSchema);