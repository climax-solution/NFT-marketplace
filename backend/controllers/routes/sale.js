let router =  require('express').Router();
const { listSign, auctionSign, deListSign, offerSign, processOfferSign } = require('../../helpers/check_sign');
const HistorySchema = require('../../models/history');
let SaleSchema = require('../../models/sale');
const ActivitySchema = require("../../models/activity-log");

router.post('/list', async(req, res) => {
    try {
        const { nonce, tokenID, price, walletAddress, action, signature, deadline } = req.body;
        const _existed = await SaleSchema.findOne({ tokenID: tokenID, action: { $in: ['list', 'auction'] } });
        if (_existed) {
            return res.status(400).json({
                error: "You have already listed"
            });
        }

        if (action === 'offer') throw new Error();

        let signed = false;

        if (action == 'list') {
            signed = await listSign(nonce, tokenID, walletAddress, price, false, signature);
        }

        else if (action == 'auction') {
            signed = await auctionSign(nonce, tokenID, walletAddress, price, deadline, false, signature);
        }

        if (!signed) throw Error();

        let _sale = new SaleSchema({
            tokenID,
            price,
            action,
            deadline : Date.parse(new Date()) + deadline * 3600 * 1000 ,
            signature,
            walletAddress
        });

        let logs = new ActivitySchema({
            walletAddress,
            tokenID,
            type : action == 'list' ? 1 : 5 ,
            price
        });
    
        await logs.save();

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
        const { tokenID, signature } = req.body;
        const _existed = await SaleSchema.findOne({ tokenID, action: { $in: ['list', 'auction' ]} });
        if (_existed) {
            let logs = new ActivitySchema({
                walletAddress : _existed.walletAddress,
                tokenID,
                type : _existed.action == 'list' ? 2 : 6 ,
                price
            });
        
            await logs.save();
            const signed = await deListSign(_existed.action, tokenID, _existed.walletAddress, _existed.price, _existed.status, signature);
            if (!signed) throw Error();
            await SaleSchema.deleteMany({ tokenID });
        }
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
        const { tokenID, status, action, signature, nonce } = req.body;
        if (action === 'offer') throw new Error();
        let _existed = await SaleSchema.findOne({ tokenID, action });
        if (!_existed) {
            return res.status(400).json({
                error: "Not listed"
            });
        }
        
        let signed = false;

        if (action == 'list') {
            signed = await listSign(nonce, tokenID, _existed.walletAddress, _existed.price, status == "premium" ? true : false, signature);
        }

        else if (action == 'auction') {
            const deadline = Math.floor((Date.parse(new Date(_existed.deadline)) - Date.parse(new Date(_existed.created_at))) / (60 * 60 * 1000));
            signed = await auctionSign(nonce, tokenID, _existed.walletAddress, _existed.price, deadline, status == "premium" ? true : false, signature);
        }

        if (!signed) throw Error();

        _existed.status = status;
        _existed.signature = signature;

        await _existed.save();

        let logs = new ActivitySchema({
            walletAddress,
            tokenID,
            type : status == 'premium' ? 3 : 4 ,
            price
        });
    
        await logs.save();

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
        const { nonce, tokenID, price, walletAddress, signature } = req.body;
        const _auctioned = await SaleSchema.findOne({ tokenID, action: "auction" });
        if (!_auctioned) {
            return res.status(400).json({
                error: "Not listed as auction"
            });
        }
        
        const _existed = await SaleSchema.findOne({ tokenID, walletAddress, action: "offer" });
        if (_existed) {
            return res.status(400).json({
                error: "You have already created offer"
            });
        }

        const signed = await offerSign(nonce, tokenID, walletAddress, price, signature);
        if (!signed) throw Error();

        const _newOffer = new SaleSchema({
            tokenID,
            price,
            walletAddress,
            signature,
            action: "offer"
        });
        await _newOffer.save();

        let logs = new ActivitySchema({
            walletAddress,
            tokenID,
            type : 7,
            price
        });
    
        await logs.save();

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
        const { walletAddress, tokenID, signature } = req.body;
        const _existed = await SaleSchema.findOne({ tokenID, walletAddress, action : 'offer' });
        if (!_existed) {
            return res.status(400).json({
                error: "No offer exist"
            });
        }
        const signed = await processOfferSign(tokenID, walletAddress, _existed.price, signature);
        if (!signed) throw Error();

        await SaleSchema.deleteOne({ tokenID, walletAddress, action : 'offer' });
        
        let logs = new ActivitySchema({
            walletAddress,
            tokenID,
            type : 8,
            price : _existed.price
        });
    
        await logs.save();

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

        let logs = new ActivitySchema({
            walletAddress : bidder,
            tokenID,
            type : 0,
            price : _existed.price
        });
    
        await logs.save();

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
        const { walletAddress } = req.body;
        const list = await SaleSchema.find({
            status: "premium",
            walletAddress: { $ne: walletAddress },
            action: { $in: ['list', 'auction'] }
        }).sort({ price: 1 }).limit(10);
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
        const { tokenID } = req.body;
        let nft = await SaleSchema.findOne({ tokenID, action: {$in : ['list', 'auction']}});
        if (!nft) {
            return res.status(400).json({
                error: "Not on sale"
            });
        }

        let childList = {};
        if (nft.action == 'auction') {
            childList = await SaleSchema.find({ tokenID, action: 'offer' });
        }

        res.status(200).json({ nft, childList });
    } catch(err) {
        console.log(err);
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

router.post('/get-bid-list', async(req, res) => {
    try {
        const { walletAddress } = req.body;
        let saleList = await SaleSchema.find({ walletAddress, action: "auction" });
        let bidList = {};
        saleList.map(async(item, index) => {
            const bid = await SaleSchema.find({ tokenID: item.tokenID, action: 'offer' });
            if (bid.length) {
                bidList[item.walletAddress] = bid;
            } else saleList.splice(index, 1);
        })

        res.status(200).json({
            nfts: saleList,
            bids: bidList
        })

    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/get-bid-item', async(req, res) => {
    try {
        const { id } = req.body;
        const existed = await SaleSchema.findById(id);
        if (!existed) {
        return res.status(400).json({
                error: "No bid exist"
            });
        }
        res.status(200).json({
            bid: existed
        });
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
})
module.exports = router;