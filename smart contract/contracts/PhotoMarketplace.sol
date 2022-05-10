// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { NFTD } from "./NFTD.sol";

contract Marketplace is Ownable{

    using SafeMath for uint256;

    struct Profit {
        bool status;
        uint256 owner;
        uint256 dev;
    }

    string public constant salt = "NFTD MARKETPLACE";
    mapping(uint => uint) public nonces;
    mapping(address => bool) public whitelist;
    mapping(uint256 => Profit) private profit;

    NFTD public flexNFT;
    // IERC20 public WBNB = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2); //mainnet weth
    IERC20 public WBNB = IERC20(0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd); //ropsten weth

    uint public fee = 250;  // 2.5%
    uint public premium_fee = 300;  // 3%
    address public treasurer;  //fee collector
    address public devWallet; // dev fee collector

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public immutable BUY_SALT;
    bytes32 public immutable SELL_SALT;

    constructor(address _nftNFT) {
        flexNFT = NFTD(_nftNFT);
        treasurer = msg.sender;
        
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256(bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")),
            keccak256("NFT Developments Marketplace"),
            keccak256("1"),
            97,
            address(this)
        ));
        BUY_SALT = keccak256(bytes("List(uint256 nonce,address from,uint256 tokenID,uint256 price,bool isPremium)"));
        SELL_SALT = keccak256(bytes("Offer(uint256 nonce,address from,uint256 tokenID,uint256 price)"));
    }

    function buy(uint tokenId, address from, uint price, bool is_premium, bytes memory signature) external payable {
        address to = msg.sender;
        require(msg.value >= price, "insufficient price");
        require(flexNFT.ownerOf(tokenId) == from, "wrong owner");
        bytes32 digest = keccak256(abi.encodePacked(uint8(0x19), uint8(0x01), DOMAIN_SEPARATOR, keccak256(abi.encode(BUY_SALT, nonces[tokenId] ++, from, tokenId, price, uint256(is_premium ? 1: 0)))));
        address recoveredAddress = ECDSA.recover(digest, signature);
        require(recoveredAddress == from, "invalid signature");
        
        flexNFT.transferFrom(from, to, tokenId);
        uint feeValue;
        uint royaltyFee;
        
        if(is_premium) {
            feeValue = msg.value.mul(premium_fee).div(10000);
        } else {
            feeValue = msg.value.mul(fee).div(10000);
        }
        
        if (!profit[tokenId].status) {
            NFTD.Royalty memory royalty = flexNFT.getRoyalty(tokenId);
            if (royalty.fee > 0) royaltyFee = msg.value.mul(royalty.fee).div(10000);
            
            if(feeValue > 0) {
                address receiver = treasurer;
                if (whitelist[msg.sender]) receiver = msg.sender;
                payable(receiver).transfer(feeValue);
            }

            if(royaltyFee > 0) payable(royalty.receiver).transfer(royaltyFee);
        }

        else {
            uint256 forOwner = feeValue * profit[tokenId].owner / 100;
            payable(flexNFT.ownerOf(tokenId)).transfer(forOwner);
            payable(devWallet).transfer(feeValue - forOwner);
        }

        payable(from).transfer(msg.value - feeValue - royaltyFee);
        
    }

    function sell(uint tokenId, address to, uint price, bool is_premium, bytes memory signature) external {
        address from = msg.sender;
        require(WBNB.balanceOf(to) >= price, "payer doen't have enough price");
        require(flexNFT.ownerOf(tokenId) == from, "wrong owner");

        bytes32 digest = keccak256(abi.encodePacked(uint8(0x19), uint8(0x01), DOMAIN_SEPARATOR, keccak256(abi.encode(SELL_SALT, nonces[tokenId] ++, to, tokenId, price))));
        address recoveredAddress = ECDSA.recover(digest, signature);
        require(recoveredAddress == to, "invalid signature");
        flexNFT.transferFrom(from, to, tokenId);
        uint feeValue;
        uint royaltyFee;

        if(is_premium) {
            feeValue = price.mul(premium_fee).div(10000);
        } else {
            feeValue = price.mul(fee).div(10000);
        }
        
        if (!profit[tokenId].status) {
            NFTD.Royalty memory royalty = flexNFT.getRoyalty(tokenId);
            if (royalty.fee > 0) royaltyFee = price.mul(royalty.fee).div(10000);
            
            if(feeValue > 0) {
                address receiver = treasurer;
                if (whitelist[msg.sender]) receiver = msg.sender;
                WBNB.transferFrom(to, receiver, feeValue);
            }

            if(royaltyFee > 0) WBNB.transferFrom(to, royalty.receiver, royaltyFee);
        }

        else {
            uint256 forOwner = feeValue * profit[tokenId].owner / 100;
            WBNB.transferFrom(to, flexNFT.ownerOf(tokenId), forOwner);
            WBNB.transferFrom(to, devWallet, feeValue - forOwner);
        }

        WBNB.transferFrom(to, from, price - feeValue - royaltyFee);

    }

    function setFee(uint _fee, uint _premium_fee) external onlyOwner{
        fee = _fee;
        premium_fee = _premium_fee;
    }

    function setTresurer(address _treasurer) external onlyOwner{
        treasurer = _treasurer;
    }

    function addWhitelist(address account) external onlyOwner {
        require(account != address(0), "Not allowed zero adddress");
        whitelist[account] = true;
    }

    function removeWhitelist(address account) external onlyOwner {
        require(account != address(0), "Not allowed zero adddress");
        whitelist[account] = false;
    }

    function setProfit(uint256 tokenID) external onlyOwner {
        require(!profit[tokenID].status, "You have already set");
        Profit memory _profit = Profit(true, 40, 60);
        profit[tokenID] = _profit;
    }

    function removeProfit(uint256 tokenID) external onlyOwner {
        require(profit[tokenID].status, "You haven't set");
        profit[tokenID].status = false;
    }

    function updateDevWallet(address account) external onlyOwner {
        require(account != address(0), "invalid address");
        require(account != devWallet, "same address");
        devWallet = account;
    }

    function updateProfitDiv(uint256 tokenID, uint256 owner) external onlyOwner {
        require(profit[tokenID].status, "you need to set profit");
        Profit memory _profit = Profit(true, owner, 100 - owner);
        profit[tokenID] = _profit;
    }
}