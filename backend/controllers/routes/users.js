let router = require('express').Router();
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
let fs = require("fs");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
let UserSchema = require('../../models/users');
let LikedLogs = require("../../models/activity-log");
const checkAuth = require("../../helpers/auth");

const { CourierClient } = require("@trycourier/courier");
const courier = CourierClient({ authorizationToken: "pk_prod_X9RTESPDMXMBN7KFYP37EDJBNS44"});
//pk_prod_YTMEXMYZA84MWVPTW3KHYS44B1S0
router.post('/get-user', async(req, res) => {
    const { walletAddress } = req.body;
    const result = await UserSchema.findOne({ walletAddress });
    if (!result) {
        return res.status(400).json({
            error: "not existing user"
        });    
    } 
    res.status(200).json(result);
})

router.post('/get-liked-nfts', async(req, res) => {
    const { id } = await checkAuth(req);
    if (!id) {
        return res.status(400).json({
            error: 'Session expired'
        });
    }
    try {
        let liked = await LikedLogs.find({ user: id });
        if (!liked) liked = []; 
        res.status(200).json({ liked });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

const storage = multer.diskStorage({
    destination: "./public/avatar",
    filename: function(req, file, cb) {
        cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({
    storage: storage
});

router.post('/update-avatar', upload.single("myfile") ,async(req, res) => {
    const { id } = await checkAuth(req);
    if (!id) {
        return res.status(400).json({
            error: 'Session expired'
        });
    }

    const oldAvatar = await UserSchema.findOne({ _id: mongoose.Types.ObjectId(id) });
    if (oldAvatar.avatar != "empty-avatar.png") fs.unlinkSync("public/avatar/" + oldAvatar.avatar);
    await UserSchema.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, {avatar: req.file.filename});
    const newUser = await UserSchema.findOne({ _id: mongoose.Types.ObjectId(id) });
    res.status(200).json(newUser)

})

router.post('/update-user', async(req, res) => {
    const { id } = await checkAuth(req);
    if (!id) {
        return res.status(400).json({
            error: 'Session expired'
        });
    }

    try {
        let data = req.body;
        const existedUser = await UserSchema.findOne({
            _id: mongoose.Types.ObjectId(id)
        });
        if (!existedUser) {
            return res.status(400).json({
                error: 'No user exist'
            });
        }
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            delete data['confirmPassword'];
            const hash = await bcrypt.hash(data.password, salt);
            data.password = hash;
        }

        await UserSchema.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, data);
        const user = await UserSchema.findOne({ _id: mongoose.Types.ObjectId(id) });
        res.status(200).json({
            status: false,
            message: "Updated Successfully",
            user
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            error: "Your request is restricted!"
        });
    }

})

router.post('/get-user-by-username', async(req, res) => {
    
    try {
        const { username } = req.body;
        const user = await UserSchema.findOne({ username });
        if (!user) {
            return res.status(400).json({
                error: "Not found user"
            });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({
            error: "Your request is restricted"
        })
    }

})

router.post('/check-existing-user', async(req, res) => {
    try {
        const data = req.body;
        const keys = Object.keys(data);
        let _result = await UserSchema.aggregate([
            {
                $addFields: {
                    exist: {
                        $regexMatch: {
                            input: "$" + keys[0],
                            regex: new RegExp(data[keys[0]], "i")
                        }
                    }
                }
            },
            {
                "$redact": {
                    "$cond": [
                        { "$eq": [ { "$strLenCP": "$" + keys[0] }, data[keys[0]].length] },
                        "$$KEEP",
                        "$$PRUNE"
                    ]
                }
            }
        ]);

        _result = _result.filter(item => item.exist === true);

        if (!_result.length) {
            return res.status(200).json({
                status: false,
                error: ""
            });
        }

        res.status(400).json({ status: true, error: "" });
    } catch (err) {
        res.status(400).json({
            status: false,
            error: "Your request is restricted"
        })
    }
})

router.post('/get-users-list', async(req, res) => {
    try {
        const list = await UserSchema.find({ role: { $ne: "ROLE_ADMIN" }});
        res.status(200).json({
            list
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

module.exports = router;