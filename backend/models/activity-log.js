let Mongoose = require('mongoose');
let { Schema } = Mongoose;

const ActivityLogs = Schema({
    walletAddress :{
        type: String
    },
    tokenID: {
        type: String
    },
    type: {
        type: String,
        enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    },
    price: {
        type: String
    },
    created_at:{
        type: Date,
        default: Date.now
    }
})
module.exports = Mongoose.model('activity_logs', ActivityLogs);

// 0 buy
// 1 on sell
// 2 down sell
// 3 to premium
// 4 to normal
// 5 on auction
// 6 down auction
// 7 make bid
// 8 cancel bid
// 9 like
// 10 dislike
// 11 claim
// [
//     "action-buy",
//     "action-sell",
//     "action-down-sell",
//     "action-to-premium",
//     "action-to-normal",
//     "action-on-auction",
//     "action-down-auction",
//     "action-make-bid",
//     "action-withdraw-bid",
//     "action-like",
//     "action-dislike",
//     "action-claim"
// ]