var Mongoose = require("mongoose");

const { Schema } = Mongoose;

const HistorySchema = Schema({
    bidder: {
        type: String
    },
    price: {
        type: "Decimal128"
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