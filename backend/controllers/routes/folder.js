let router = require('express').Router();
const FolderSchema = require('../../models/folders');
const NFTSchema = require('../../models/nfts');
const SaleSchema = require('../../models/sale');
const UserSchema = require('../../models/users');

router.post('/create-new-items', async(req, res) => {
    try {
        const { name, artist, category, list } = req.body;
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

        if (!list.length) {
            return res.status(400).json({
                error: "List is empty"
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
            category
        });

        const newFolder = await folder.save();
        console.log(list[0]);
        for (let i = 0; i < list.length; i ++) {
            const _existingNFT = await NFTSchema.findOne({ tokenID: list[i] });
            if (!_existingNFT) {
                const newNFT = new NFTSchema({
                    tokenID: list[i],
                    folderID: newFolder._id.toString()
                });
                await newNFT.save();
            }
        }

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

router.post('/add-items-to-old', async(req, res) => {
    try {
        const { folderID, list } = req.body;
        if (!folderID) {
            return res.status(400).json({
                error: "Folder id is required"
            });
        }

        if (!list.length) {
            return res.status(400).json({
                error: "List is empty"
            });
        }

        const _existedFolder = await FolderSchema.findOne({ _id: mongoose.Types.ObjectId(folderID) });
        if (!_existedFolder) {
            return res.status(400).json({
                error: "No folder exist"
            });
        }

        for (let i = 0; i < list.length; i ++) {
            const _existingNFT = await NFTSchema.findOne({ tokenID: list[i] });
            if (!_existingNFT) {
                const newNFT = new NFTSchema({
                    tokenID: list[i],
                    folderID
                });
                await newNFT.save();
            }
        }

        res.status(200).json({
            message: "Added success"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/get-folder-list', async(req, res) => {
    try {
        const list = await FolderSchema.find();
        res.status(200).json({
            list
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/get-sale-folder-list', async(req, res) => {
    try {
        let list = await FolderSchema.find();
        list.map(item => {
            const ban = NFTSchema.findOne({ folderID: item._id.toString() });
            item.tokenID = ban.tokenID;
        });
        res.status(200).json({
            list
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/get-folder-detail', async(req, res) => {
    try {
        const { folderID } = req.body;
        let list = await NFTSchema.find({ folderID });
        for await (let item of list) {
            const saled = await SaleSchema.findOne({ tokenID: item.tokenID, action: {$in: ['list', 'auction'] }});
            item = { ...item, ...saled};
        }
        const folder = await FolderSchema.findById(folderID);
        const artist = await UserSchema.findOne({ username: folder.artist });
        res.status(200).json({
            list, artist, description: folder.description
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            error: "Your request is restricted"
        })
    }
});

router.post('/get-folder-interface', async(req, res) => {
    try {
        const { folderID } = req.body;
        const folder = await FolderSchema.findById(folderID);
        const artistData = await UserSchema.findOne({ username: folder.artist });
        const initialNFT = await NFTSchema.findOne({ folderID });

        res.status(200).json({ list: { folder, artistData }, initialNFT });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        })
    }
});

module.exports = router;