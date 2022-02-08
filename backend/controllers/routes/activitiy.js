const checkAuth = require("../../helpers/auth");
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
        let { avatar } = await UserSchema.findOne({ walletAddress: item.walletAddress });
        if (!avatar) avatar = "empty-avatar.png";
        item._doc = { ...item._doc, avatar: avatar};
    }

    res.status(200).json(list);
});

module.exports = router;