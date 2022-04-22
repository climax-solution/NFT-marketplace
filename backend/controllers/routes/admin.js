const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { ADMIN } = require("../../config/key");
const UserSchema = require('../../models/users');
const AdminSchema = require('../../models/admin');
const FolderSchema = require('../../models/folder');

router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await AdminSchema.findOne({});
        if (admin.username == username) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                const token = jwt.sign({ id: admin.id }, ADMIN, { expiresIn: ADMIN.tokenLife });
                res.status(200).json({
                    token,
                    status: true
                });
            }

            else {
                return res.status(400).json({
                    error: "Password is not correct"
                });
            }
        } else {
            return res.status(400).json({
                error: "No existing user"
            });
        }
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/remove-user', async(req, res) => {
    try {
        const { id } = req.body;
        await UserSchema.deleteOne({ _id: Mongoose.Types.ObjectId(id) });
        res.status(200).json({
            message: "Removed successfully!"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/remove-folder', async(req, res) => {
    try {
        const { id } = req.body;
        await FolderSchema.deleteOne({ _id: Mongoose.Types.ObjectId(id) });
        res.status(200).json({
            message: "Removed successfully!"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

module.exports = router;