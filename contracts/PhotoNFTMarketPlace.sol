// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

//import { ERC20 } from './openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import { PhotoNFT } from "./PhotoNFT.sol";
import { PhotoNFTTradable } from "./PhotoNFTTradable.sol";
import { PhotoNFTMarketplaceEvents } from "./photo-nft-marketplace/commons/PhotoNFTMarketplaceEvents.sol";
import { PhotoNFTData } from "./PhotoNFTData.sol";


contract PhotoNFTMarketplace is PhotoNFTTradable, PhotoNFTMarketplaceEvents {

    address public PHOTO_NFT_MARKETPLACE;

    // address private _market_owner;
    address public _market_owner;

    // PhotoNFTData public photoNFTData;

    constructor(PhotoNFTData _photoNFTData, address owner) public PhotoNFTTradable(_photoNFTData) {
        photoNFTData = _photoNFTData;
        address payable PHOTO_NFT_MARKETPLACE = payable(address(this));
        _market_owner = owner;
    }

    function getOwnerPayableAddress() public returns(address payable) {
        return payable(_market_owner);
    }

    /** 
     * @notice - Buy function is that buy NFT token and ownership transfer. (Reference from IERC721.sol)
     * @notice - msg.sender buy NFT with ETH (msg.value)
     * @notice - PhotoID is always 1. Because each photoNFT is unique.
     */
    function buyPhotoNFT(PhotoNFT _photoNFT) public payable returns (bool) {
        PhotoNFT photoNFT = _photoNFT;

        PhotoNFTData.Photo memory photo = photoNFTData.getPhotoByNFTAddress(photoNFT);
        address _seller = photo.ownerAddress;                     // Owner
        address payable seller = payable(_seller);  // Convert owner address with payable
        uint buyAmount = photo.photoPrice;
        require (msg.value == buyAmount, "msg.value should be equal to the buyAmount");

        uint photoIndex = photoNFTData.getPhotoIndex(photoNFT);
         
        // Bought-amount is transferred into a seller wallet

        if (photoIndex < 1001) {
            seller.transfer(buyAmount); // send full amount to the seller
        }
        else {
            if (photo.premiumStatus) {
                seller.transfer(buyAmount * 90 / 100);
                getOwnerPayableAddress().transfer(buyAmount / 10);
            }
            else {
                seller.transfer(buyAmount * 95 / 100);
                getOwnerPayableAddress().transfer(buyAmount / 20); //send fee
            }
        }
        

        // Approve a buyer address as a receiver before NFT's transferFrom method is executed
        address buyer = msg.sender;
        uint photoId = 1;  // [Note]: PhotoID is always 1. Because each photoNFT is unique.
        photoNFT.approve(buyer, photoId);

        address ownerBeforeOwnershipTransferred = photoNFT.ownerOf(photoId);

        // Transfer Ownership of the PhotoNFT from a seller to a buyer
        transferOwnershipOfPhotoNFT(photoNFT, photoId, buyer);    
        photoNFTData.updateOwnerOfPhotoNFT(photoNFT, buyer);
        photoNFTData.updateStatus(photoNFT, "Cancelled", 0);

        // Event for checking result of transferring ownership of a photoNFT
        address ownerAfterOwnershipTransferred = photoNFT.ownerOf(photoId);
        emit PhotoNFTOwnershipChanged(photoNFT, photoId, ownerBeforeOwnershipTransferred, ownerAfterOwnershipTransferred);

        // Mint a photo with a new photoId
        //string memory tokenURI = photoNFTFactory.getTokenURI(photoData.ipfsHashOfPhoto);  // [Note]: IPFS hash + URL
        //photoNFT.mint(msg.sender, tokenURI);
    }

    function transferMarketplaceOwnership(address newOwner) public returns (bool) {
        // only the owner can send this
        require(msg.sender == _market_owner, "sender should be the market owner");
        //set the marketplace owner
        _market_owner = newOwner;
    }


    ///-----------------------------------------------------
    /// Methods below are pending methods
    ///-----------------------------------------------------

    /** 
     * @dev reputation function is that gives reputation to a user who has ownership of being posted photo.
     * @dev Each user has reputation data in struct
     */
    function reputation(address from, address to, uint256 photoId) public returns (uint256, uint256) {

        // Photo storage photo = photos[photoId];
        // photo.reputation = photo.reputation.add(1);

        // emit AddReputation(photoId, photo.reputation);

        // return (photoId, photo.reputation);
        return (0, 0);
    }
    

    function getReputationCount(uint256 photoId) public view returns (uint256) {
        uint256 curretReputationCount;

        // Photo memory photo = photos[photoId];
        // curretReputationCount = photo.reputation;

        return curretReputationCount;
    }    

}
