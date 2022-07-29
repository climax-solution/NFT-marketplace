var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const UserSchema = Schema({
    name: {
        type: String
    },
    // username: {
    //     type: String,
    //     lowercase: true
    // },
    // email: {
    //     type: String,
    //     // required: () => {
    //     //     return this.provider !== 'email' ? false : true
    //     // },
    //     lowercase: true
    // },
    walletAddress: {
        type: String,
        lowercase: true
    },
    // password: {
    //     type: String
    // },
    avatar: {
        default: "empty-avatar.png",
        type: String
    },
    facebook: {
        type: String
    },
    instagram: {
        type: String
    },
    twitter: {
        type: String
    },
    linkedin: {
        type: String
    },
    tiktok: {
        type: String
    },
    telegram: {
        type: String
    },
    description: {
        type: String
    },
    role: {
        type: String,
        default: 'ROLE_VISITOR',
        enum: ['ROLE_VISITOR', 'ROLE_CREATOR', 'ROLE_ADMIN']
    },
    // verified: {
    //     type: Boolean,
    //     default: true
    // },
    // verifyToken: {
    //     type: String
    // },
    // resetPasswordToken: {
    //     type: String
    // },
    // resetPasswordExpires: {
    //     type: Date
    // },
    updated_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('User', UserSchema);