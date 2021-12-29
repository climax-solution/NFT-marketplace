import Web3 from "web3";

const node = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org'
]

const getWeb3 = async() => {
  let web3; let ranId;
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    if (networkId != 56) {
      ranId = Math.floor(Math.random() * 5);
      const provider = new Web3.providers.HttpProvider(node[ranId]);
      web3 = new Web3(provider);
    }
  }

  else {
    ranId = Math.floor(Math.random() * 5);
    const provider = new Web3.providers.HttpProvider(node[ranId]);
    web3 = new Web3(provider);
    //console.log("No web3 instance injected, using Infura/Local web3.");
  }

  //console.log(web3);
  
  return web3;
}

export default getWeb3;
