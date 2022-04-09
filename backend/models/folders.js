var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const FolderSchema = Schema({
    name: {
        type: String
    },
    artist: {
        type: String,
        lowercase: true
    },
    category: {
        type: String,
        lowercase: true
    },
    description: {
        type: String
    },
    isPublic:{
        type: Boolean,
        default: false
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