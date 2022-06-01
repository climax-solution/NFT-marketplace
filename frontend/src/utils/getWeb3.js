import Web3 from "web3";
import NFTABI from "../abi/PhotoNFT.json";
import MarketplaceABI from "../abi/PhotoMarketplace.json";
import WethABI from "../abi/WBNB.json";
import { marketplace_addr, nft_addr, wbnb_addr } from "../config/address.json";

// const node = [
//   'https://bsc-dataseed.binance.org'
// ]

const getWeb3 = async() => {
  let _web3;
  if (window.ethereum) {
    _web3 = new Web3(window.ethereum);
    const networkId = await _web3.eth.net.getId();
    if (networkId !== 56) {
      const provider = new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org");
      _web3 = new Web3(provider);
    }
  }

  else {
    const provider = new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org");
    _web3 = new Web3(provider);
  }

  const instanceNFT = new _web3.eth.Contract(NFTABI, nft_addr);
  const instanceMarketplace = new _web3.eth.Contract(MarketplaceABI, marketplace_addr);
  const instanceWBNB = new _web3.eth.Contract(WethABI, wbnb_addr);

  return { _web3, instanceNFT, instanceMarketplace, instanceWBNB };
}

export default getWeb3;
