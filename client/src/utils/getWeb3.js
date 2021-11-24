import Web3 from "web3";

const getWeb3 = () => {
  let web3;
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  }
  
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    web3 = window.web3;
    //console.log("Injected web3 detected.");
  }
  // Fallback to localhost; use dev console port by default...
  else {
    const provider = new Web3.providers.HttpProvider(
      'https://bsc-dataseed1.binance.org'
    );
    web3 = new Web3(provider);
    //console.log("No web3 instance injected, using Infura/Local web3.");
  }
  return web3;
}


export default getWeb3;
