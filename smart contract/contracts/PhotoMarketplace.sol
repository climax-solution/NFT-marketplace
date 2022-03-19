// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { NFTD } from "./NFTD.sol";

contract Marketplace {

    using SafeMath for uint256;

    string public constant salt = "NFTD MARKETPLACE";
    mapping(address => bool) public whitelist;
    mapping(address => uint) public nonces;

    NFTD public flexNFT;
    // IERC20 public WETH = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2); //mainnet weth
    IERC20 public WETH = IERC20(0xc778417E063141139Fce010982780140Aa0cD5Ab); //ropsten weth

    uint public fee = 250;  // 2.5%
    uint public premium_fee = 300;
    address public _market_owner;  //fee collector

    constructor(address _nft, address market_owner_) {
        flexNFT = NFTD(_nft);
        _market_owner = market_owner_;
    }

    modifier onlyOwner() {
        require(msg.sender == _market_owner, "account is not market owner");
        _;
    }

    function buy(uint tokenId, address from, uint price, bool is_premium, bytes memory signature) external payable {
        address to = msg.sender;
        require(msg.value >= price, "insufficient price");
        require(flexNFT.ownerOf(tokenId) == from, "wrong owner");
        bytes32 digest = keccak256(abi.encodePacked(salt, keccak256(abi.encodePacked(nonces[from] ++, from, tokenId, price, is_premium))));
        address recoveredAddress = ECDSA.recover(digest, signature);
        require(recoveredAddress == from, "invalid signature");
        flexNFT.transferFrom(from, to, tokenId);
        uint feeValue;
        uint royaltyFee;
        NFTD.Royalty memory royalty = flexNFT.getRoyalty(tokenId);

        if(!whitelist[from]) {
            if (is_premium) {
                feeValue = msg.value.mul(premium_fee).div(10000);
            } else  {
                feeValue = msg.value.mul(fee).div(10000);
            }
          if (royalty.fee > 0) royaltyFee = msg.value.mul(royalty.fee).div(10000);
        }
        if(feeValue > 0) payable(_market_owner).transfer(feeValue);
        if (royaltyFee > 0) payable(royalty.receiver).transfer(royaltyFee);
        payable(from).transfer(msg.value - feeValue - royaltyFee);
    }

    function sell(uint tokenId, address to, uint price, bool is_premium, bytes memory signature) external {
        address from = msg.sender;
        require(WETH.balanceOf(to) >= price, "payer doen't have enough price");
        require(flexNFT.ownerOf(tokenId) == from, "wrong owner");
        bytes32 digest = keccak256(abi.encodePacked(salt, keccak256(abi.encodePacked(nonces[to] ++, to, tokenId, price))));
        address recoveredAddress = ECDSA.recover(digest, signature);
        require(recoveredAddress == to, "invalid signature");
        flexNFT.transferFrom(from, to, tokenId);
        uint feeValue;
        uint royaltyFee;
        NFTD.Royalty memory royalty = flexNFT.getRoyalty(tokenId);

        if(!whitelist[from]) {
            if (is_premium) {
                feeValue = price.mul(premium_fee).div(10000);
            } else  {
                feeValue = price.mul(fee).div(10000);
            }
            if (royalty.fee > 0) royaltyFee = price.mul(royalty.fee).div(10000);
        }
        
        if(feeValue > 0) WETH.transferFrom(to, _market_owner, feeValue);
        if (royaltyFee > 0) WETH.transferFrom(to, royalty.receiver, royaltyFee);
        WETH.transferFrom(to, from, price - feeValue - royaltyFee);
    }

    function setWhitelist(address to, bool value) external onlyOwner{
        whitelist[to] = value;
    }

    function setFee(uint _fee) external onlyOwner{
        fee = _fee;
    }

    function setMarketOwner(address market_owner_) external onlyOwner{
        _market_owner = market_owner_;
    }
}