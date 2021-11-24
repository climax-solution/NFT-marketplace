const PhotoMarketplace = artifacts.require("./PhotoMarketplace.sol");
const PhotoNFT = artifacts.require("./PhotoNFT.sol");

const _photoNFT = PhotoNFT.address;
const _marketplaceOwner = '0xCdE2C94E148227c5b3832E0fA31207326D35ea0e';
const _whiteUser = '0xebc6B3c6F7724BB214b7CF5994078BB883208a98';

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoMarketplace, _photoNFT, _marketplaceOwner, _whiteUser);
};
