let router =  require('express').Router();
const HistorySchema = require('../../models/history');
let SaleSchema = require('../../models/sale');

router.post('/list', async(req, res) => {
    try {
        const { tokenID, price, walletAddress, action, signature, deadline } = req.body;
        const _existed = await SaleSchema.findOne({ tokenID: tokenID, action: {$in: ['list', 'auction']} });
        if (_existed) {
            return res.status(400).json({
                error: "You have already listed"
            });
        }

        if (action === 'offer') throw new Error();

        let _sale = new SaleSchema({
            tokenID,
            price,
            action,
            deadline,
            signature,
            walletAddress
        });

        await _sale.save();
        res.status(200).json({
            message: "Listed successfully"
        });

    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
})

router.post('/delist', async(req, res) => {
    try {
        const { tokenID, walletAddress } = req.body;
        await SaleSchema.deleteMany({ tokenID, walletAddress });
        res.status(200).json({
            message: "Unlisted successfully"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
})

router.post('/update-premium', async(req, res) => {
    try {
        const { tokenID, status, action, signature } = req.body;
        if (action === 'offer') throw new Error();
        let _existed = await SaleSchema.findOne({ tokenID, action });
        if (!_existed) {
            return res.status(400).json({
                error: "Not listed"
            });
        }
        
        _existed.status = status;
        _existed.signature = signature;

        await _existed.save();

        res.status(200).json({
            message: "Listed successfully"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
})

router.post('/create-new-offer', async(req, res) => {
    try {
        const { tokenID, price, walletAddress } = req.body;
        const _auctioned = await SaleSchema.findOne({ tokenID, action: "auction" });
        if (!_auctioned) {
            return res.status(400).json({
                error: "Not listed as auction"
            });
        }
        
        const _existed = await SaleSchema.findOne({ tokenID, action: "offer" });
        if (_existed) {
            return res.status(400).json({
                error: "You have already created offer"
            });
        }

        const _newOffer = new SaleSchema({
            tokenID,
            price,
            walletAddress
        });
        _newOffer.save();

        res.status(200).json({
            message: "Your offer is requested"
        });
        
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/cancel-offer', async(req, res) => {
    try {
        const { walletAddress, tokenID } = req.body;
        await SaleSchema.deleteOne({ tokenID, walletAddress, action : 'offer' });
        res.status(200).json({
            message: "Cancelled successfully"
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/accept-offer', async(req, res) => {
    try {
        const { bidder, tokenID } = req.body;
        const _existed = await SaleSchema.findOne({ tokenID, walletAddress: bidder, action: 'offer' });
        if (!_existed) {
            return res.status(400).json({
                error: "No offer exist"
            });
        }
        let newHistory = new HistorySchema({
            price: _existed.price,
            tokenID,
            bidder: bidder
        });
        
        await newHistory.save();
        await SaleSchema.deleteMany({ tokenID });
        res.status(200).json({
            message: "You have accepted offer"
        });

    } catch(err) {
        res.status(400).json({
            error: "Your request is stricted"
        });
    }
});

router.post('/get-premium-list', async(req, res) => {
    try {
        const list = await SaleSchema.find({ status: "premium" }).sort({ price: 1 }).limit(10);
        res.status(200).json({
            list
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        })
    }
});

router.post('/get-nft-item', async(req, res) => {
    try {
        const { tokenID, walletAddress } = req.body;
        let nft = await SaleSchema.findOne({ tokenID, walletAddress, action: {$in : ['list', 'auction']}});
        if (!nft) {
            return res.status(400).json({
                error: "Not on sale"
            });
        }

        res.status(200).json({ nft });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/get-sale-list', async(req, res) => {
    try {
        const { walletAddress } = req.body;
        let nfts = await SaleSchema.find({ walletAddress, action: {$in : ['list', 'auction']}});
        res.status(200).json({ list: !nfts ? [] : nfts });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

module.exports = router;