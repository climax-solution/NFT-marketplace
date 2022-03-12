let router =  require('express').Router();
const HistorySchema = require('../../models/history');
let SaleSchema = require('../../models/sale');

router.post('/list', async(req, res) => {
    try {
        const { tokenID, price, address, type, sign, deadline } = req.body;
        const _existed = await SaleSchema.findOne({ tokenID: tokenID, type: {$in: ['list', 'auction']} });
        if (_existed) {
            return res.status(400).json({
                error: "You have already listed"
            });
        }

        if (type === 'offer') throw new Error();

        let _sale = new SaleSchema({
            tokenID,
            price,
            type,
            deadline,
            sign,
            address
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
        const { tokenID, status, type, sign } = req.body;
        if (type === 'offer') throw new Error();
        let _existed = await SaleSchema.findOne({ tokenID, type });
        if (!_existed) {
            return res.status(400).json({
                error: "Not listed"
            });
        }
        _existed = await SaleSchema.findOne({ tokenID, type, status });
        
        if (!_existed) {
            return res.status(400).json({
                error: "You have already done"
            });
        }

        _existed.status = status;
        _existed.sign = sign;

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

router.post('/create-new-offer', async(req, res) => {
    try {
        const { tokenID, price, walletAddress } = req.body;
        const _auctioned = await SaleSchema.findOne({ tokenID, type: "auction" });
        if (!_auctioned) {
            return res.status(400).json({
                error: "Not listed as auction"
            });
        }
        
        const _existed = await SaleSchema.findOne({ tokenID, type: "offer" });
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
        await SaleSchema.deleteOne({ tokenID, walletAddress, type : 'offer' });
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
        const _existed = await SaleSchema.findOne({ tokenID, walletAddress: bidder, type: 'offer' });
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
module.exports = router;