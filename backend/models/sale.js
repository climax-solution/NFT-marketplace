var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const SaleSchema = Schema({
    tokenID: {
        type: Number
    },
    price: {
        type: Double
    },
    status: {
        type: String,
        default: 'normal',
        enum: ['premium', 'normal']
    },
    type: {
        type: String,
        enum: ['list', 'auction', 'offer']
    },
    deadline: {
        type: Date
    },
    signature: {
        type: String
    },
    walletAddress: {
        type: String
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