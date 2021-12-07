const PhotoMarketplace = artifacts.require("./PhotoMarketplace.sol");
const PhotoNFT = artifacts.require("./PhotoNFT.sol");

const _photoNFT = PhotoNFT.address;
const _marketplaceOwner = '0x3530e9D7E112b78c4778Be38C83708a9F8f7223B';
const _whiteUser = '0x3530e9D7E112b78c4778Be38C83708a9F8f7223B';

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoMarketplace, _photoNFT, _marketplaceOwner, _whiteUser);
};
