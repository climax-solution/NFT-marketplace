import Web3 from "web3";
import NFTABI from "../abi/PhotoNFT.json";
import MarketplaceABI from "../abi/PhotoMarketplace.json";
import WethABI from "../abi/WBNB.json";
import { marketplace_addr, nft_addr, wbnb_addr } from "../config/address.json";

// const node = [
//   'https://bsc-dataseed.binance.org',
//   'https://bsc-dataseed1.binance.org',
//   'https://bsc-dataseed2.binance.org',
//   'https://bsc-dataseed3.binance.org',
//   'https://bsc-dataseed4.binance.org'
// ]

const node = [
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
  "https://data-seed-prebsc-2-s1.binance.org:8545/",
  "https://data-seed-prebsc-1-s2.binance.org:8545/",
  "https://data-seed-prebsc-2-s2.binance.org:8545/",
  "https://data-seed-prebsc-1-s3.binance.org:8545/",
  "https://data-seed-prebsc-2-s3.binance.org:8545/"
];

const getWeb3 = async() => {
  let _web3; let ranId;
  if (window.ethereum) {
    _web3 = new Web3(window.ethereum);
    const networkId = await _web3.eth.net.getId();
    if (networkId !== 97) {
      ranId = Math.floor(Math.random() * 5);
      const provider = new Web3.providers.HttpProvider(node[ranId]);
      // const provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e5f6b05589544b1bb8526dc3c034c63e");
      _web3 = new Web3(provider);
    }
  }

  else {
    ranId = Math.floor(Math.random() * 5);
    const provider = new Web3.providers.HttpProvider(node[ranId]);
    // const provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e5f6b05589544b1bb8526dc3c034c63e");
    _web3 = new Web3(provider);
    //console.log("No _web3 instance injected, using Infura/Local _web3.");
  }

  const instanceNFT = new _web3.eth.Contract(NFTABI, nft_addr);
  const instanceMarketplace = new _web3.eth.Contract(MarketplaceABI, marketplace_addr);
  const instanceWBNB = new _web3.eth.Contract(WethABI, wbnb_addr);

  return { _web3, instanceNFT, instanceMarketplace, instanceWBNB };
}

export default getWeb3;
