const PhotoMarketplace = artifacts.require("PhotoMarketplace");
const PhotoNFT = artifacts.require("PhotoNFT");

const _photoNFT = PhotoNFT.address;
// const _marketplaceOwner = '0xCdE2C94E148227c5b3832E0fA31207326D35ea0e';
// const _whiteUser = '0xebc6B3c6F7724BB214b7CF5994078BB883208a98';
const _marketplaceOwner = '0x0F09aE2ba91449a7B4201721f98f482cAF9737Ee';
const _whiteUser = '0x8bD154D7b5ADbDab1d45D5C59512F2e9EbBcF219';

module.exports = async function(deployer) {
    await deployer.deploy(PhotoMarketplace, _photoNFT, _marketplaceOwner, _whiteUser);
};
