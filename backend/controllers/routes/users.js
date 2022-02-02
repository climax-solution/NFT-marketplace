let router = require('express').Router();
const multer = require("multer");
const path = require("path");
let UserSchema = require('../../models/users');
let LikedLogs = require("../../models/liked-logs");
const checkAuth = require("../../helpers/auth");

router.post('/get-user', async(req, res) => {
    const token = await checkAuth(req);
    if (!token) {
        return res.status(400).json({
            error: 'Session expired'
        });
    }
    const { id } = token;
    const result = await UserSchema.findOne({ _id: { $in: [id] } });
    
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

    const oldAvatar = await UserSchema.findOne({ _id: { $in: [id] } });

    console.log(oldAvatar);

    await UserSchema.findOneAndUpdate({ _id: { $in: [id] } }, {avatar: req.file.filename});

    res.status(200).json({
        success: true
    })

})


module.exports = router;