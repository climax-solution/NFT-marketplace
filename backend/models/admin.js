const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const Admin = new Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = Mongoose.model('admin', Admin);