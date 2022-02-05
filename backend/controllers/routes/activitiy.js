const checkAuth = require("../../helpers/auth");
const UserSchema = require("../../models/users");
const ActivitySchema = require("../../models/activity-log");
const router = require("express").Router();

router.post('/create-logs', async(req, res) => {
    const { tokenID, id, price, type } = req.body;
    const { walletAddress } = await UserSchema.findOne({ _id: { $in: [id] }});

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

router.post('/get-logs', async(req, res) => {
    const { type } = req.body;
    const query = type ? { type } : {};
    const list = await ActivitySchema.find(query);
    res.status(200).json({
        list
    });
});

module.exports = router;