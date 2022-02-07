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

router.post('/get-logs', async(req, res) => {
    const { type } = req.body;
    const query = type ? { type } : {};
    const list = await ActivitySchema.find(query);
    res.status(200).json({
        list
    });
});

module.exports = router;