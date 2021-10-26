const PhotoNFTMarketplace = artifacts.require("./PhotoNFTMarketplace.sol");
const PhotoNFTData = artifacts.require("./PhotoNFTData.sol");

const _photoNFTData = PhotoNFTData.address;
const _marketplaceOwner = '0xebc6B3c6F7724BB214b7CF5994078BB883208a98';
//setowner
// 0xebc6B3c6F7724BB214b7CF5994078BB883208a98
module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoNFTMarketplace, _photoNFTData, _marketplaceOwner);
};
