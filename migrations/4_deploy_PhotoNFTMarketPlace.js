const PhotoNFTMarketplace = artifacts.require("./PhotoNFTMarketplace.sol");
const PhotoNFTData = artifacts.require("./PhotoNFTData.sol");

const _photoNFTData = PhotoNFTData.address;
const _marketplaceOwner = '0x211A5f4D4A72FDDe0f7Ce2b02C25a011aEf85ca4';
//setowner

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoNFTMarketplace, _photoNFTData, _marketplaceOwner);
};
