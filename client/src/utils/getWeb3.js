import Web3 from "web3";
// require('dotenv').config();
// const INFURA_API_KEY = process.env.INFURA_API_KEY;

//const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK || 'https://rinkeby.infura.io/v3/' + INFURA_API_KEY;    // Rinkeby
//const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK || 'http://0.0.0.0:7545';                                 // Ganache-GUI
const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK;


const getWeb3 = (e_name) =>
   new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener(e_name, async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          FALLBACK_WEB3_PROVIDER
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Infura/Local web3.");
        resolve(web3);
      }
    });
  });
const getGanacheWeb3 = () => {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return null;
  }
  const provider = new Web3.providers.HttpProvider(
    //'https://rinkeby.infura.io/v3/' + INFURA_API_KEY  // Rinkeby
    // 'https://ropsten.infura.io/v3/' + "e5f6b05589544b1bb8526dc3c034c63e"  // Rinkeby
    'http://127.0.0.1:7545'  // Ganache-GUI
    // 'http://127.0.0.1:8545'  // Ganache-CLI
  );
  const web3 = new Web3(provider);
  console.log("No local ganache found.");
  return web3;
}

export default getWeb3;
export { getGanacheWeb3, Web3 };
