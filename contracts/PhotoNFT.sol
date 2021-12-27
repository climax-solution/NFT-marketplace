// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
}

contract PhotoNFT is ERC721URIStorage {

    uint256 public currentPhotoId;
    address private _owner;
    using Strings for uint256;

    struct Photo {
        uint tokenID;
        string tokenURI;
        address owner;
    }

    event NFTMinted(uint tokenId);

    constructor(address owner) ERC721("NFT DEVELOPMENTS", "NFT DEVELOPMENTS") {
        _owner = owner;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Not owner");
        _;
    }

    function bulkMint(string memory baseURI, uint256 count) public onlyOwner {
        baseURI = string(abi.encodePacked(baseURI, "/"));
        for (uint i = 0; i < count; i ++) {
            _mint(msg.sender, currentPhotoId);
            string memory _BaseURI = string(abi.encodePacked("https://ipfs.io/ipfs/", baseURI));
            _setTokenURI(currentPhotoId, string(abi.encodePacked(_BaseURI, i.toString())));
            currentPhotoId++;
        }
        emit NFTMinted(currentPhotoId);
    }

    function getPhoto(uint index) public view returns (Photo memory _photo) {
        _photo = Photo ({
            tokenID: index, 
            tokenURI : tokenURI (index), 
            owner : ownerOf(index)
        });
    }

    function cancelTrade(uint tokenID) public {
        _approve(address(0), tokenID);
    }

    function bulkApprove(address to, uint start, uint count) public onlyOwner {
        for (uint i; i < count; i ++) {
            approve(to, start + i);
        }
    }
}