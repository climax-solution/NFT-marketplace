import Web3 from "web3";

const getWeb3 = async() => {
  let web3;
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    if (networkId != 3) {
      const provider = new Web3.providers.HttpProvider(
        'https://ropsten.infura.io/v3/e5f6b05589544b1bb8526dc3c034c63e'
      );
      web3 = new Web3(provider);
    }
  }

  else {
    const provider = new Web3.providers.HttpProvider(
      'https://ropsten.infura.io/v3/e5f6b05589544b1bb8526dc3c034c63e'
    );
    web3 = new Web3(provider);
    //console.log("No web3 instance injected, using Infura/Local web3.");
  }

  //console.log(web3);
  
  return web3;
}


export default getWeb3;
