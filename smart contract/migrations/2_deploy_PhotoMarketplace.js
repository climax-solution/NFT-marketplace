const PhotoMarketplace = artifacts.require("Marketplace");
const NFTAddress = "0xc6130D74BA424cb91a500dA5153420d91Ad751f2";

module.exports = async function(deployer) {
    await deployer.deploy(PhotoMarketplace, NFTAddress);
};
