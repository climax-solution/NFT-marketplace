const PhotoNFTMarketplace = artifacts.require("./PhotoNFTMarketplace.sol");
const PhotoNFTData = artifacts.require("./PhotoNFTData.sol");

const _photoNFTData = PhotoNFTData.address;
const _marketplaceOwner = '0x163bf5BdEEC4935ebf8071f981ab26A6AED1B315';
//setowner

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoNFTMarketplace, _photoNFTData, _marketplaceOwner);
};
