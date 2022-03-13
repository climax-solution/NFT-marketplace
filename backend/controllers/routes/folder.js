let router = require('express').Router();
const FolderSchema = require('../../models/folders');

router.post('/create-folder', async(req, res) => {
    try {
        const { name, artist, range } = req.body;
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

        if (range.length !== 2) {
            return res.status(400).json({
                error: "Range require start and end"
            });
        }

        let folder = new FolderSchema({
            name,
            artist,
            range: [range]
        });

        await folder.save();
        res.status(200).json({
            message: "Created new folder successfully"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

module.exports = router;