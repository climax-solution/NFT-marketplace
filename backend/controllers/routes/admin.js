const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { ADMIN } = require("../../config/key");

const UserSchema = require('../../models/users');
const AdminSchema = require('../../models/admin');
const FolderSchema = require('../../models/folders');
const NFTSchema = require('../../models/nfts');

router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await AdminSchema.findOne({});
        if (admin.username == username) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                const token = jwt.sign({ id: admin._id.toString() }, ADMIN.secret, { expiresIn: ADMIN.tokenLife });
                res.status(200).json({
                    token,
                    expiresIn: 3600,
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

router.post('/register', async(req, res) => {
    try {
        const { username, password } = req.body;
        
        const exist = await AdminSchema.find();
        if (exist.length) {
            return res.status(400).json({
                error: "You have already registered"
            });
        }

        if (!password) {
            return res.status(400).json({ error: 'You must enter a password.' });
        }

        if (!username) {
            return res.status(400).json({ error: 'You must enter a user name.' });
        }

        let user = new AdminSchema({
            username,
            password,
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        
        user.password = hash;
        const _user = await user.save();

        const token = jwt.sign({ id: _user._id.toString() }, ADMIN.secret, { expiresIn: ADMIN.tokenLife });
        res.status(200).json({
            token,
            expiresIn: ADMIN.tokenLife,
            status: true
        });

    } catch(err) {
        console.log(err)
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/remove-user', async(req, res) => {
    try {
        const { id } = req.body;
        await UserSchema.findByIdAndDelete(id);
        res.status(200).json({
            message: "Removed successfully!"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/create-empty-folder', async(req, res) => {
    try {
        const { name, artist, category, description } = req.body;
        if (!name) {
            return res.status(400).json({
                error: "Name is not defined"
            });
        }

        if (!artist) {
            return res.status(400).json({
                error: "Artist is not defined"
            });
        }

        if (!category) {
            return res.status(400).json({
                error: "Category is required"
            });
        }

        let folder = new FolderSchema({
            name,
            artist,
            category,
            description
        });

        await folder.save();

        res.status(200).json({
            message: "Add NFTs and folder successfully"
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/remove-folder', async(req, res) => {
    try {
        const { id } = req.body;
        await FolderSchema.findByIdAndRemove(id);
        res.status(200).json({
            message: "Removed successfully!"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/move-nfts-to-folder', async(req, res) => {
    try {
        const { folderID, list } = req.body;
        if (!folderID || !list.length) {
            return res.status(400).json({
                error: "FolderID or Token IDs is empty"
            });
        }

        await NFTSchema.updateMany({ tokenID: {$in: list} }, { folderID: folderID });
        res.status(200).json({
            message: "moved success"
        });

    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/modify-user', async(req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({
            error: 'Session expired'
        });
    }

    try {
        let data = req.body;
        const existedUser = await UserSchema.findById(id);

        if (!existedUser) {
            return res.status(400).json({
                error: 'No user exist'
            });
        }

        if (data.username) {
            const _existedUsername = await UserSchema.findOne({ walletAddress: data.username });
            if (_existedUsername && (_existedUsername._id).toString() != id) {
                return res.status(400).json({
                    error: 'Existing wallet address'
                });
            }
        }

        if (data.walletAddress) {
            const _existedWallet = await UserSchema.findOne({ walletAddress: data.walletAddress });
            if (_existedWallet && (_existedWallet._id).toString() != id) {
                return res.status(400).json({
                    error: 'Existing wallet address'
                });
            }
        }

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(data.password, salt);
            data.password = hash;
        }

        await UserSchema.findByIdAndUpdate(id, data);
        res.status(200).json({
            message: "Updated Successfully",
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            error: "Your request is restricted!"
        });
    }
});

module.exports = router;