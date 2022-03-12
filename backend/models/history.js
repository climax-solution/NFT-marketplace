var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const HistorySchema = Schema({
    bidder: {
        type: String
    },
    price: {
        type: Double
    },
    tokenID: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = HistorySchema;