const PhotoNFT = artifacts.require("./PhotoNFT.sol");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoNFT);
};