// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { PhotoNFT } from "./PhotoNFT.sol";

contract PhotoMarketplace  {
    address private _market_owner;
    address private white_user;
    uint256 public premiumLimit = 2592000; //30 * 24 * 3600

    PhotoNFT public photoNFT;
    mapping(uint => PhotoMarketData) private _photoData;

    event NFTPremiumStatusChanged(uint256 tokenId, bool newState, uint timeStamp);
    event NFTBuy(address owner, address buyer, uint tokenId);

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

    struct FolderList {
        string folder;
        uint[2] wide;
    }

    FolderList[] public sub_folders;

    constructor(address _photoNFT, address owner, address _whiteUser) {
        photoNFT = PhotoNFT(_photoNFT);
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
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else getOwnerPayableAddress().transfer(msg.value); //send fee
        _photoData[_photoId].marketStatus = true;
        _photoData[_photoId].price = msg.value * 40;
    }

    function cancelTrade(uint256 _photoId) public payable {
        require(msg.sender == photoNFT.ownerOf(_photoId), "Message Sender should be the owner of token");
        _addDataIfNotExist(_photoId);
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else getOwnerPayableAddress().transfer(msg.value); 
        _photoData[_photoId].marketStatus = false;
        photoNFT.cancelTrade(_photoId);
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

    function getPhoto(uint index) public view returns (PhotoData memory photoData) {
        photoData = PhotoData ({
            nftData : photoNFT.getPhoto(index), 
            marketData : getMarketData(index)
        });
    }

    function updatePremiumStatus(uint256 _photoId, bool _newState) public payable {
        require(msg.sender == photoNFT.ownerOf(_photoId), "Message Sender should be the owner of token");
        if (white_user == msg.sender) payable(white_user).transfer(msg.value); //white user
        else getOwnerPayableAddress().transfer(msg.value); //send fee
        _photoData[_photoId].premiumStatus = _newState;
        if (_newState == true) _photoData[_photoId].premiumTimestamp = block.timestamp;
        else _photoData[_photoId].premiumTimestamp = 0;

        emit NFTPremiumStatusChanged(_photoId, _newState, block.timestamp);
    }

    function getMarketData(uint tokenId) public view returns (PhotoMarketData memory marketData) {
        marketData = _photoData[tokenId];
        if ((marketData.premiumStatus) && (block.timestamp - marketData.premiumTimestamp > premiumLimit)) {
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
        require (msg.value == buyAmount, "Balance should be equal to the buyAmount");

        if (photoMarketData.premiumStatus) {
            seller.transfer(buyAmount * 95 / 100);
            if (white_user == msg.sender) payable(white_user).transfer(buyAmount / 20); //white user
            else getOwnerPayableAddress().transfer(buyAmount / 20);
        }
        else {
            seller.transfer(buyAmount * 97 / 100);
            if (white_user == msg.sender) payable(white_user).transfer(buyAmount * 23 / 100); //white user
            else getOwnerPayableAddress().transfer(buyAmount * 23 / 100); //send fee
        }
        
        address buyer = msg.sender;
        photoNFT.transferFrom(_seller, buyer, tokenId);
        photoNFT.cancelTrade(tokenId);
        _photoData[tokenId].premiumStatus = false;
        _photoData[tokenId].marketStatus = false;
        _photoData[tokenId].premiumTimestamp = 0;
        emit NFTBuy(_seller, buyer, tokenId);
    }

    function getOwnerPayableAddress() public view returns(address payable) {
        return payable(_market_owner);
    }
    
    function getPremiumNFTList() public view returns(PhotoData[] memory) {
        uint idx = 0;
        PhotoData[] memory list = new PhotoData[](photoNFT.currentPhotoId());
        for (uint i = 0; i < photoNFT.currentPhotoId(); i ++ ) {
            if (_photoData[i].premiumStatus) list[idx++] = getPhoto(i);
        }
        return list;
    }

    function getPersonalNFTList() public view returns(PhotoData[] memory) {
        uint idx = 0;
        PhotoData[] memory list = new PhotoData[](photoNFT.currentPhotoId());
        for (uint i = 0; i < photoNFT.currentPhotoId(); i ++ ) {
            if (photoNFT.ownerOf(i) ==  msg.sender) list[idx++] = getPhoto(i);
        }
        return list;
    }

    function mutipleOpenTrade(uint start, uint count, uint price, string memory group) external onlyOwner {
        bool existance = false;
        for (uint i = 0; i < sub_folders.length; i ++) {
            if (keccak256(abi.encodePacked(sub_folders[i].folder)) == keccak256(abi.encodePacked(group))) existance = true;
        }
        if (!existance) {
            for (uint i = 0; i < count; i ++) {
                uint _photoId = start + i;
                require(msg.sender == photoNFT.ownerOf(_photoId), "Message Sender should be the owner of token");
                _addDataIfNotExist(_photoId);
                _photoData[_photoId].marketStatus = true;
                _photoData[_photoId].price = price;
            }
            sub_folders.push(FolderList({
                folder: group,
                wide: [start, count]
            }));
        }

    }

    function getFolderList() public view returns(FolderList[] memory list) {
        list  = sub_folders;
    }

    function getSubFolderItem(uint idx) public view returns(PhotoData[] memory) {
        FolderList memory item = sub_folders[idx];
        PhotoData[] memory list = new PhotoData[](item.wide[1]);
        for (uint i = 0; i < item.wide[1]; i ++ ) {
            list[i] = getPhoto(item.wide[0] + i);
        }
        return list;
    }
}