const PhotoMarketplace = artifacts.require("Marketplace");
const NFTAddress = "0xBF89f6B7b4C4239A3E939567D8aaa4d6B33Ebefc";
// const _marketplaceOwner = '0xCdE2C94E148227c5b3832E0fA31207326D35ea0e';
// const _whiteUser = '0xebc6B3c6F7724BB214b7CF5994078BB883208a98';

module.exports = async function(deployer) {
    await deployer.deploy(PhotoMarketplace, NFTAddress);
};
