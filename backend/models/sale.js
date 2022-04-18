var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const SaleSchema = Schema({
    tokenID: {
        type: Number
    },
    price: {
        type: String
    },
    status: {
        type: String,
        default: 'normal',
        enum: ['premium', 'normal']
    },
    action: {
        type: String,
        enum: ['list', 'auction', 'offer']
    },
    deadline: {
        type: Number
    },
    signature: {
        type: String
    },
    walletAddress: {
        type: String,
        lowercase: true
    },
    updated_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('Sale', SaleSchema);