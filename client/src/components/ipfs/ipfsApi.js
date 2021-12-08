//using the infura.io node, otherwise ipfs requires you to run a daemon on your own computer/server. See ipfs.infura.io/ipfs docs
// const IPFS = require('ipfs-api');
// const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

//run with local daemon
const ipfsApi = require('ipfs-api');
const ipfs = new ipfsApi('ipfs.infura.io', 5001, {protocol: 'https'});

export default ipfs; 
