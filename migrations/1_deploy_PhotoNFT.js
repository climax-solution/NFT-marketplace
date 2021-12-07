const PhotoNFT = artifacts.require("./PhotoNFT.sol");
const owner = "0x3530e9D7E112b78c4778Be38C83708a9F8f7223B";

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(PhotoNFT, owner);
};