// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { NFTD } from "./NFTD.sol";

contract Marketplace  {
    address private _market_owner;
    address private white_user;
    uint256 public premiumLimit = 2592000; //30 * 24 * 3600
    uint256 public minAuctionPrice = 100000000000000000;

    NFTD public flexNFT;
    mapping(uint => MarketData) private _nftData;

    event NFTPremiumStatusChanged(uint256 tokenId, bool newState, uint timeStamp);
    event NFTBuy(address owner, address buyer, uint tokenId);
    event OpenTradeToDirect(address owner, uint tokenID, uint256 price);
    event CloseTradeToDirect(address owner, uint tokenID);
    event OpenTradeToAuction(address owner, uint tokenID, uint period);
    event CloseTradeToAuction(address owner, uint tokenID);
    event PlaceBid(address owner, uint256 bidPrice);
    event WithdrawBid(address owner, uint tokenID);
    event ClaimNFT(address winner, uint tokenID, uint256 price);

    struct MarketData {
        uint price;
        bool marketStatus; // false : Cancel, true : Open
        bool existance;
        bool premiumStatus;
        uint256 premiumTimestamp;
    }

    struct ItemNFT {
        NFTD.ItemNFT nftData;
        MarketData marketData;
        Auction auctionData;
    }

    struct FolderList {
        string folder;
        string category;
        uint[2] wide;
    }

    struct Auction {
        address currentBidOwner; // Address of the highest bider
        uint256 currentBidPrice; // Current highest bid for the auction
        uint256 endAuction; // Timestamp for the end day&time of the auction
        uint256 bidCount; // Number of bid placed on the auction
        uint256 minPrice;
        bool existance;
    }

    FolderList[] public sub_folders;
    mapping(uint => Auction) public auctions;

    constructor(address _nftNFT, address owner, address _whiteUser) {
        flexNFT = NFTD(_nftNFT);
        _market_owner = owner;
        white_user = _whiteUser;
    }

    /**
     * @dev Opens a trade by the seller.
     */
    modifier onlyOwner() {
        require(_market_owner == msg.sender, "Not owner");
        _;
    }

    function openTradeToDirect(uint tokenID) external payable {
        require(msg.sender == flexNFT.ownerOf(tokenID), "Not owner");
        require(!_nftData[tokenID].marketStatus, "Already on sale");
        require(!auctions[tokenID].existance, "Already on auction");
        _addDataIfNotExist(tokenID);
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else payable(_market_owner).transfer(msg.value); //send fee
        _nftData[tokenID].marketStatus = true;
        _nftData[tokenID].price = msg.value * 40;
        emit OpenTradeToDirect(msg.sender, tokenID, msg.value * 40);
    }

    function closeTradeToDirect(uint tokenID) external payable {
        require(msg.sender == flexNFT.ownerOf(tokenID), "Not owner");
        require(_nftData[tokenID].marketStatus, "Already down sale");
        require(!auctions[tokenID].existance, "Already on auction");
        require(msg.value >= _nftData[tokenID].price / 40, "Tax is not enough");
        _addDataIfNotExist(tokenID);
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else payable(_market_owner).transfer(msg.value); 
        _nftData[tokenID].marketStatus = false;
        flexNFT.cancelTrade(tokenID);
        emit CloseTradeToDirect(msg.sender, tokenID);
    }

    function openTradeToAuction(uint tokenID, uint auctionPrice, uint period) external payable {
        require(msg.sender == flexNFT.ownerOf(tokenID), "Not owner");
        require(!_nftData[tokenID].marketStatus, "Already on sale");
        require(!auctions[tokenID].existance, "Already on auction");
        require(auctionPrice >= minAuctionPrice, "Auction price must be higher than min price");

        auctions[tokenID] = Auction({
            currentBidOwner: address(0),
            currentBidPrice: 0,
            endAuction: block.timestamp + period * 1 hours,
            bidCount: 0,
            minPrice: auctionPrice,
            existance: true
        });
        emit OpenTradeToAuction(msg.sender, tokenID, period);
    }

    function closeTradeToAuction(uint tokenID) external payable {
        require(msg.sender == flexNFT.ownerOf(tokenID), "Not owner");
        require(_nftData[tokenID].marketStatus, "Already on sale");
        require(auctions[tokenID].existance, "Already on auction");
        require(auctions[tokenID].currentBidPrice == 0, "Bid is existing");
        delete auctions[tokenID];
        emit CloseTradeToAuction(msg.sender, tokenID);
    }

    function _addDataIfNotExist(uint tokenID) private {
        if (_nftData[tokenID].existance == true) return;
        _nftData[tokenID] = MarketData({
            price : 0, 
            marketStatus : false, 
            existance : true, 
            premiumStatus : false, 
            premiumTimestamp : 0
        });
    }

    function getItemNFT(uint tokenID) public view returns (ItemNFT memory _item) {
        _item = ItemNFT ({
            nftData : flexNFT.getItemNFT(tokenID), 
            marketData : getMarketData(tokenID),
            auctionData: auctions[tokenID]
        });
    }
    
    function getMarketData(uint tokenID) internal view returns (MarketData memory marketData) {
        marketData = _nftData[tokenID];
        if ((marketData.premiumStatus) && (block.timestamp - marketData.premiumTimestamp > premiumLimit)) {
            marketData.premiumStatus = false;
            marketData.premiumTimestamp = 0;
        }
        return marketData;
    }

    function buyNFT(uint tokenID) external payable {
        MarketData memory marketData = _nftData[tokenID];
        require(marketData.marketStatus, "Not able to buy");
        require(!auctions[tokenID].existance, "Already on auction");
        
        address _seller = flexNFT.ownerOf(tokenID);    // Owner
        address payable seller = payable(_seller);  // Convert owner address with payable

        uint buyAmount = marketData.price;
        require (msg.value == buyAmount, "Balance should be equal to the buyAmount");

        if (marketData.premiumStatus) {
            seller.transfer(buyAmount * 95 / 100);
            if (white_user == msg.sender) payable(white_user).transfer(buyAmount / 20); //white user
            else payable(_market_owner).transfer(buyAmount / 20);
        }
        else {
            seller.transfer(buyAmount * 97 / 100);
            if (white_user == msg.sender) payable(white_user).transfer(buyAmount * 3 / 100); //white user
            else payable(_market_owner).transfer(buyAmount * 3 / 100); //send fee
        }
        
        address buyer = msg.sender;
        flexNFT.transferFrom(_seller, buyer, tokenID);
        flexNFT.cancelTrade(tokenID);
        _nftData[tokenID].premiumStatus = false;
        _nftData[tokenID].marketStatus = false;
        _nftData[tokenID].premiumTimestamp = 0;
        emit NFTBuy(_seller, buyer, tokenID);
    }

    function placeBid(uint tokenID) external payable {
        Auction memory auction = auctions[tokenID];
        require(auction.existance, "Not on auction");
        require(msg.value > auction.currentBidPrice, "Bid price must be higher that last price");
        require(block.timestamp < auction.endAuction, "Auction is ended");

        if (auction.currentBidOwner != address(0)) {
            payable(auction.currentBidOwner).transfer(auction.currentBidPrice);
        }

        auction.currentBidOwner = msg.sender;
        auction.currentBidPrice = msg.value;

        emit PlaceBid(msg.sender, msg.value);
    }

    function withdrawBid(uint tokenID) external payable {
        Auction memory auction = auctions[tokenID];
        require(auction.existance, "Not on auction");
        require(block.timestamp < auction.endAuction, "Auction is ended");
        require(auction.currentBidOwner == msg.sender, "Not last bidder");
        payable(auction.currentBidOwner).transfer(auction.currentBidPrice);
        auction.currentBidOwner = address(0);

        emit WithdrawBid(msg.sender, tokenID);
    }

    function claimNFT(uint tokenID) external payable {
        Auction memory auction = auctions[tokenID];
        require(auction.existance, "Not on auction");
        require(block.timestamp >= auction.endAuction, "Auction is not ended");
        require(auction.currentBidOwner == msg.sender, "Not winner");
        address _seller = flexNFT.ownerOf(tokenID);
        payable(_seller).transfer(auction.currentBidPrice);
        flexNFT.transferFrom(_seller, msg.sender, tokenID);
        _nftData[tokenID].premiumStatus = false;
        _nftData[tokenID].marketStatus = false;
        _nftData[tokenID].premiumTimestamp = 0;
        emit ClaimNFT(msg.sender, tokenID, auction.currentBidPrice);
        delete auctions[tokenID];
    }

    function getPremiumNFTList() public view returns(ItemNFT[] memory) {
        uint idx = 0;
        ItemNFT[] memory list = new ItemNFT[](flexNFT.lastID());
        for (uint i = 0; i < flexNFT.lastID(); i ++ ) {
            if (_nftData[i].premiumStatus) list[idx++] = getItemNFT(i);
        }
        return list;
    }

    function getPersonalNFTList() public view returns(ItemNFT[] memory) {
        uint idx = 0;
        ItemNFT[] memory list = new ItemNFT[](flexNFT.lastID());
        for (uint i = 0; i < flexNFT.lastID(); i ++ ) {
            if (flexNFT.ownerOf(i) ==  msg.sender) list[idx++] = getItemNFT(i);
        }
        return list;
    }

    function mutipleOpenTrade(uint start, uint count, uint price, string memory group, string memory category) external onlyOwner {
        bool existance = false;
        for (uint i = 0; i < sub_folders.length; i ++) {
            if (keccak256(abi.encodePacked(sub_folders[i].folder)) == keccak256(abi.encodePacked(group))) existance = true;
        }
        if (!existance) {
            for (uint i = 0; i < count; i ++) {
                uint tokenID = start + i;
                require(msg.sender == flexNFT.ownerOf(tokenID), "Message Sender should be the owner of token");
                _addDataIfNotExist(tokenID);
                _nftData[tokenID].marketStatus = true;
                _nftData[tokenID].price = price;
            }
            sub_folders.push(FolderList({
                folder: group,
                category: category,
                wide: [start, count]
            }));
        }

    }

    function getFolderList() external view returns(FolderList[] memory list) {
        list  = sub_folders;
    }

    function getSubFolderItem(uint idx) external view returns(ItemNFT[] memory, string memory) {
        FolderList memory item = sub_folders[idx];
        ItemNFT[] memory list = new ItemNFT[](item.wide[1]);
        string memory folderName = item.folder;
        for (uint i = 0; i < item.wide[1]; i ++ ) {
            list[i] = getItemNFT(item.wide[0] + i);
        }

        return (list, folderName);
    }
}