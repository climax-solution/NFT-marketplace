const PhotoNFT = artifacts.require("PhotoNFT");
const owner = "0xCdE2C94E148227c5b3832E0fA31207326D35ea0e";

module.exports = async function(deployer) {
    await deployer.deploy(PhotoNFT, owner);
};