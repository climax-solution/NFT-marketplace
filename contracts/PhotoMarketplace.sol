// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { PhotoNFT } from "./PhotoNFT.sol";

contract PhotoMarketplace  {
    address public PHOTO_NFT_MARKETPLACE;

    uint256 public premiumLimit = 2592000; //30 * 24 * 3600

    // address private _market_owner;
    address private _market_owner;
    address private white_user;

    PhotoNFT public photoNFT;
    mapping(uint => PhotoMarketData) private _photoData;

    event NFTPremiumStatusChanged(uint256 tokenId, bool newState, uint timeStamp);
    event NFTBuy(address owner, address operator);

    struct PhotoMarketData {
        uint tokenID;
        uint price;
        bool marketStatus; // false : Cancel, true : Open
        bool existance;
        bool premiumStatus;
        uint256 premiumTimestamp;
    }

    struct PhotoData {
        PhotoNFT.Photo nftData;
        PhotoMarketData marketData;
    }

    constructor(PhotoNFT _photoNFT, address owner, address _whiteUser) {
        // photoNFTData = _photoNFTData;
        // address payable PHOTO_NFT_MARKETPLACE = payable(address(this));
        photoNFT = _photoNFT;
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

    function openTrade( uint256 _photoId) public payable {
        
        require(msg.sender == photoNFT.ownerOf(_photoId), "Message Sender should be the owner of token");
        _addDataIfNotExist(_photoId);
        // require(condition);
        // photoNFT.approve(address(this), _photoId);
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else getOwnerPayableAddress().transfer(msg.value); //send fee
        _photoData[_photoId].marketStatus = true;
        _photoData[_photoId].price = msg.value * 20;
    }

    function cancelTrade(uint256 _photoId) public payable {
        require(msg.sender == photoNFT.ownerOf(_photoId), "Message Sender should be the owner of token");
        _addDataIfNotExist(_photoId);
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else getOwnerPayableAddress().transfer(msg.value); 
        photoNFT.cancelTrade(_photoId);
         _photoData[_photoId].marketStatus = false;
    }

    function _addDataIfNotExist(uint nPhotoID) private{
        if (_photoData[nPhotoID].existance == true) return;
        _photoData[nPhotoID] = PhotoMarketData({
            tokenID : nPhotoID, 
            price : 0, 
            marketStatus : false, 
            existance : true, 
            premiumStatus : false, 
            premiumTimestamp : 0
        });
    }

    function getPhoto(uint index) public view returns (PhotoData memory _photo) {
        PhotoData memory photoData = PhotoData ({
            nftData : photoNFT.getPhoto(index), 
            marketData : getMarketData(index)
        });

        return photoData;
    }

    function getAllPhotos() public view returns (PhotoData[] memory _photos) {
        PhotoData[] memory result = new PhotoData[](photoNFT.currentPhotoId());
        for (uint i = 0; i < photoNFT.currentPhotoId(); i++) {
            // Photo memory photo = getPhoto(i);
            result[i] = getPhoto(i);
        }
        return result;
    }

    function updatePremiumStatus(uint256 _photoId, bool _newState) public payable{
        address owner = photoNFT.ownerOf(_photoId);
        require(
            msg.sender == owner,
            "Trade can be open only by seller."
        );

        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else getOwnerPayableAddress().transfer(msg.value); //send fee
        _photoData[_photoId].premiumStatus = _newState;
        if (_newState == true) _photoData[_photoId].premiumTimestamp = block.timestamp;
        else _photoData[_photoId].premiumTimestamp = 0;

        // emit NFTPremiumStatusChanged(_photoId, _newState, block.timestamp);
    }

    function getMarketData(uint tokenId) public view returns (PhotoMarketData memory _marketData) {
        PhotoMarketData memory marketData = _photoData[tokenId];
        if ((marketData.premiumStatus) && (marketData.premiumTimestamp + premiumLimit > block.timestamp)) {
            marketData.premiumStatus = false;
            marketData.premiumTimestamp = 0;
        }
        return marketData;
    }

    function buyNFT(uint tokenId) public payable {

        address _seller = photoNFT.ownerOf(tokenId);    // Owner
        address payable seller = payable(_seller);  // Convert owner address with payable
        PhotoMarketData memory photoMarketData = _photoData[tokenId];

        uint buyAmount = photoMarketData.price;
        require (msg.value == buyAmount, "msg.value should be equal to the buyAmount");
        

        // uint photoIndex = photoNFTData.getPhotoIndex(photoNFT);
         
        // Bought-amount is transferred into a seller wallet

        if (photoMarketData.premiumStatus) {
            seller.transfer(buyAmount * 90 / 100);
            if (white_user == msg.sender) payable(white_user).transfer(buyAmount / 10); //white user
            else getOwnerPayableAddress().transfer(buyAmount / 10);
        }
        else {
            seller.transfer(buyAmount * 95 / 100);
            if (white_user == msg.sender) payable(white_user).transfer(buyAmount / 20); //white user
            else getOwnerPayableAddress().transfer(buyAmount / 20); //send fee
        }
        

        // transfer ownership
        address buyer = msg.sender;
        photoNFT.transferFrom(_seller, buyer, tokenId);
        // emit NFTBuy(_seller, photoNFT.getApproved(tokenId));

        // set marketplace data
        _photoData[tokenId].premiumStatus = false;
        _photoData[tokenId].marketStatus = false;
        _photoData[tokenId].premiumTimestamp = 0;
        photoNFT.cancelTrade(tokenId);    
    }

    function getOwnerPayableAddress() public view returns(address payable) {
        return payable(_market_owner);
    }
    
    function mutipleOpenTrade(uint start, uint count, uint price) external onlyOwner {
        for (uint i = 0; i < count; i ++) {
            uint _photoId = start + i;
            require(msg.sender == photoNFT.ownerOf(_photoId), "Message Sender should be the owner of token");
            _addDataIfNotExist(_photoId);
            // require(condition);
            // photoNFT.approve(address(this), _photoId);
            _photoData[_photoId].marketStatus = true;
            _photoData[_photoId].price = price;
        }
    }
}