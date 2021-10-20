// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { PhotoNFTDataStorages } from "./photo-nft-data/commons/PhotoNFTDataStorages.sol";
import { PhotoNFT } from "./PhotoNFT.sol";


/**
 * @notice - This is the storage contract for photoNFTs
 */
contract PhotoNFTData is PhotoNFTDataStorages {

    address[] public photoAddresses;

    uint256 public premiumLimit = 2592000; //30 * 24 * 3600

    constructor() public {}

    /**
     * @notice - Save metadata of a photoNFT
     */
    function saveMetadataOfPhotoNFT(
        address[] memory _photoAddresses, 
        PhotoNFT _photoNFT, 
        string memory _photoNFTName, 
        string memory _photoNFTSymbol, 
        address _ownerAddress, 
        uint _photoPrice, 
        string memory _ipfsHashOfPhoto, 
        string memory desc
    ) public returns (bool) {

        Photo memory photo = Photo({ ///make a photo data
            photoNFT: _photoNFT,
            photoNFTName: _photoNFTName,
            photoNFTSymbol: _photoNFTSymbol,
            ownerAddress: _ownerAddress,
            photoPrice: _photoPrice,
            ipfsHashOfPhoto: _ipfsHashOfPhoto,
            status: "Cancelled",
            reputation: 0, 
            premiumStatus : false, 
            photoNFTDesc : desc,
            premiumTimestamp : 0, 
            createdAt : block.timestamp
        });
        photos.push(photo);

        /// Update photoAddresses
        photoAddresses = _photoAddresses;     
    }

    /**
     * @notice - Update owner address of a photoNFT by transferring ownership
     */
    function updateOwnerOfPhotoNFT(PhotoNFT _photoNFT, address _newOwner) public returns (bool) {
        
        uint photoIndex = getPhotoIndex(_photoNFT);  
        Photo storage photo = photos[photoIndex];  
        require (_newOwner != address(0), "A new owner address should be not empty");
        photo.ownerAddress = _newOwner;  
    }

    /**
     * @notice - Update status ("Open" or "Cancelled")
     */
    function updateStatus(PhotoNFT _photoNFT, string memory _newStatus, uint price) public returns (bool) {
        
        uint photoIndex = getPhotoIndex(_photoNFT); 
        Photo storage photo = photos[photoIndex]; 
        photo.status = _newStatus;  
        if (price != 0) photo.photoPrice = price;
    }

    /**
     * @notice - Update status ("Open" or "Cancelled")
     */
    function updatePremiumStatus(PhotoNFT _photoNFT, bool _newStatus) public returns (bool) {
        
        uint photoIndex = getPhotoIndex(_photoNFT); // Identify photo's index
        
        Photo storage photo = photos[photoIndex]; // Update metadata of a photoNFT of photo
        photo.premiumStatus = _newStatus;  

        //if _newstatus : true then save timestamp
        if (_newStatus) photo.premiumTimestamp = block.timestamp;
        else photo.premiumTimestamp = 0;
    }
    ///-----------------
    /// Getter methods
    ///-----------------
    function getPhoto(uint index) public view returns (Photo memory _photo) {
        Photo memory photo = photos[index];
        if ((photo.premiumStatus) && (photo.premiumTimestamp + premiumLimit > block.timestamp)) {
            photo.premiumStatus = false;
            photo.premiumTimestamp = 0;
        }
        return photo;
    }

    function getPhotoIndex(PhotoNFT photoNFT) public view returns (uint _photoIndex) {
        address PHOTO_NFT = address(photoNFT);

        
        uint photoIndex; /// Identify member's index
        for (uint i=0; i < photoAddresses.length; i++) {
            if (photoAddresses[i] == PHOTO_NFT) {
                photoIndex = i;
            }
        }

        return photoIndex;   
    }

    function getPhotoByNFTAddress(PhotoNFT photoNFT) public view returns (Photo memory _photo) {
        address PHOTO_NFT = address(photoNFT);

        
        uint photoIndex; /// Identify member's index
        for (uint i=0; i < photoAddresses.length; i++) {
            if (photoAddresses[i] == PHOTO_NFT) {
                photoIndex = i;
            }
        }

        Photo memory photo = photos[photoIndex];
        return photo;
    }

    function getAllPhotos() public view returns (Photo[] memory _photos) {
        Photo[] memory result;
        result = photos;
        for (uint i = 0; i < result.length; i++) {
            if ((result[i].premiumStatus) && (result[i].premiumTimestamp + premiumLimit < block.timestamp)) {
                result[i].premiumStatus = false;
                result[i].premiumTimestamp = 0;
            }
        }
        return result;
    }

}
