let Mongoose = require('mongoose');
let { Schema } = Mongoose;

const LikedLogs = Schema({
    user :{
        type: String
    },
    tokenID: {
        type: String
    },
    created_at:{
        type: Date,
        default: Date.now
    }
})
module.exports = Mongoose.model('liked_logs', LikedLogs);