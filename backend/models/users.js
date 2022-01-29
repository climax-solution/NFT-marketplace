var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const UserSchema = Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    username: {
        type: String
    },
    email: {
        type: String,
        required: () => {
            return this.provider !== 'email' ? false : true
        }
    },
    phoneNumber: {
        type: String
    },
    walletAddress: {
        type: String
    },
    country: {
        type: String
    },
    password: {
        type: String
    },
    avatar: {
        type: String
    },
    facebookID: {
        type: String
    },
    instagramID: {
        type: String
    },
    role: {
        type: String,
        default: 'ROLE_VISITOR',
        enum: ['ROLE_VISITOR', 'ROLE_CREATOR', 'ROLE_ADMIN']
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    updated_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('User', UserSchema);