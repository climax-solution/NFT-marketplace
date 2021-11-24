// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { ERC721 } from "./openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "./openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @notice - This is the NFT contract for a photo
 */
contract PhotoNFT is ERC721URIStorage {

    uint256 public currentPhotoId;

    struct Photo {
        uint tokenID;
        string tokenURI;
        address owner;
    }

    event NFTMinted(uint tokenId);

    
    constructor() public ERC721("NFT DEVELOPMENTS", "NFT DEVELOPMENTS") 
    {
        // mint(owner, _tokenURI);
    }

    /** 
     * @dev mint a photoNFT
     * @dev tokenURI - URL include ipfs hash
     */
    function mint(string memory tokenURI) public {

        uint newPhotoId = currentPhotoId;
        _mint(msg.sender, newPhotoId);
        _setTokenURI(newPhotoId, tokenURI);
        currentPhotoId++;
        emit NFTMinted(newPhotoId);
        
    }

    function getPhoto(uint index) public view returns (Photo memory _photo) {
        Photo memory photo = Photo ({
            tokenID: index, 
            tokenURI : tokenURI (index), 
            owner : ownerOf(index)
        });

        return photo;
    }

    function getAllPhotos() public view returns (Photo[] memory _photos) {
        Photo[] memory result = new Photo[](currentPhotoId);
        for (uint i = 0; i < currentPhotoId; i++) {
            // Photo memory photo = getPhoto(i);
            result[i] = getPhoto(i);
        }
        return result;
    }

    function cancelTrade(uint tokenID) public {
        _approve(address(0), tokenID);
    }

    ///--------------------------------------
    /// Getter methods
    ///--------------------------------------


    ///--------------------------------------
    /// Private methods
    ///--------------------------------------
    /**
     * @return nextPhotoId
     */
    
}
