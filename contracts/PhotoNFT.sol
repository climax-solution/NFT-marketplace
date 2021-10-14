// SPDX-License-Identifier: MIT
/**
 * Created on 2021-10-12 00:15
 * @summary: 
 * @author: Jupiter
 */
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { ERC721 } from "./openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "./openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


/**
 * @notice - This is the NFT contract for a photo
 */
contract PhotoNFT is ERC721URIStorage {

    uint256 public currentPhotoId;
    
    constructor(
        address owner,  string memory _nftName, string memory _nftSymbol, string memory _tokenURI, uint photoPrice
    ) 
        public 
        ERC721(_nftName, _nftSymbol) 
    {
        mint(owner, _tokenURI);
    }

    /** 
     * @dev mint a photoNFT
     * @dev tokenURI - URL include ipfs hash
     */
    function mint(address to, string memory tokenURI) public returns (bool) {

        uint newPhotoId = getNextPhotoId();
        currentPhotoId++;
        _mint(to, newPhotoId);
        _setTokenURI(newPhotoId, tokenURI);
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
    function getNextPhotoId() private returns (uint nextPhotoId) {
        return currentPhotoId + 1;
    }
    

}
