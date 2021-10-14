const PhotoNFTFactory = artifacts.require("./PhotoNFTFactory.sol");
const PhotoNFTMarketplace = artifacts.require("./PhotoNFTMarketplace.sol");
const PhotoNFTData = artifacts.require("./PhotoNFTData.sol");

const _photoNFTMarketplace = PhotoNFTMarketplace.address;
const _photoNFTData = PhotoNFTData.address;

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoNFTFactory, _photoNFTMarketplace, _photoNFTData);
};
