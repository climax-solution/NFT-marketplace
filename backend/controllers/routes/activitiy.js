const UserSchema = require("../../models/users");
const ActivitySchema = require("../../models/activity-log");
const router = require("express").Router();

router.post('/create-log', async(req, res) => {
    const { tokenID, walletAddress, price, type } = req.body;

    let logs = new ActivitySchema({
        walletAddress,
        tokenID,
        type,
        price
    });

    await logs.save();

    res.status(200).json({
        success: true
    })
});

router.get('/get-logs', async(req, res) => {
    const { b, type } = req.query;
    const query = type ? { type } : {};
    let list = await ActivitySchema.find(query);
    list = list.slice(Number(b), Number(b) + 5);
    for await (let item of list) {
        let user = await UserSchema.findOne({ walletAddress: item.walletAddress });
        let avatar = user ? user.avatar : "empty-avatar.png";
        item._doc = { ...item._doc, avatar: avatar, firstName: user ? user.firstName : '???', lastName: user ? user.lastName : "???"};
    }

    res.status(200).json(list);
});

router.post('/get-likes', async(req,res) => {
    const { tokenID, walletAddress } = req.body;
    try {
        const liked = await ActivitySchema.count({ tokenID: tokenID, type: "9" });
        const disLiked = await ActivitySchema.count({ tokenID: tokenID, type: "10" });
        const lastAct = await ActivitySchema.find({ walletAddress, tokenID, type: { $in: ["9", "10"]} }, {}, { sort: { 'created_at' : 1 } })
        res.status(200).json({
            liked: (liked - disLiked) < 0 ? 0 : (liked - disLiked),
            lastAct: lastAct.length ? lastAct[lastAct.length - 1].type : "10"
        });

    } catch(err) {
        res.status(200).json({
            liked: 0,
            lastAct: "10"
        })
    }
})

router.post('/get-top-sellers', async(req, res) => {
    try {
        let seller = await ActivitySchema.aggregate([
            {
                $match: {
                    type: { $in: ["1", "5"]}
                }
            },
            {
                $group:
                   {
                    _id: "$walletAddress",
                    price: { $sum: "$price" }
                }
            }
        ]).sort({ price: 'desc', _id: 'desc'}).limit(12);
        
        let list = [];
        for await (let item of seller) {
            let user = await UserSchema.findOne({ walletAddress: item._id });
            if (!user) {
                item = {
                    avatar: "empty-avatar.png",
                    firstName: "----",
                    lastName: "---",
                    ...item
                };
            }
            list.push({ ...user?._doc, ...item});
        }

        res.status(200).json(list);
    } catch(err) {
        console.log(err);
    }
})
module.exports = router;