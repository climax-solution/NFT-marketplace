require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');  // @notice - Should use new module.
const mnemonic = 'master gallery almost century lonely label anxiety refuse cable super kitten autumn'; // process.env.;

const INFURA_API_KEY="e5f6b05589544b1bb8526dc3c034c63e";

process.env.INFURA_KEY = INFURA_API_KEY
//console.log('https://ropsten.infura.io/v3/' + process.env.INFURA_KEY);
// console.log('env', process.env.INFURA_KEY)
// const provider = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/' + process.env.INFURA_KEY);
// console.log(provider);

module.exports = {
    plugins:[
        'truffle-plugin-verify'
    ],
    api_keys: {
        bscscan: "ANZWAZS69JPGZYJKQ9ZKID8AQM5UGRA32G",
        etherscan: "5Z1RRTM3R1VF8U9BS6DVBZZEACU5XUN59Q"
    },
  networks: {
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/' + INFURA_API_KEY),
      network_id: 3,
      gas: 4712388,
      //gas: 4465030,          // Original
      //gasPrice: 5000000000,  // 5 gwei (Original)
      //gasPrice: 10000000000, // 10 gwei
      gasPrice: 100000000000,  // 100 gwei
      skipDryRun: true,        // Skip dry run before migrations? (default: false for public nets)
      networkCheckTimeout: 1000000

    },
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, 'https://kovan.infura.io/v3/' + process.env.INFURA_KEY),
      network_id: '42',
      gas: 6465030,
      gasPrice: 5000000000, // 5 gwei
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets)
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + process.env.INFURA_KEY),
      network_id: 4,
      gas: 6000000,         // 2 times than before
      gasPrice: 5000000000, // 5 gwei,
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets)
      //from: process.env.DEPLOYER_ADDRESS
    },
    testnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-1-s1.binance.org:8545/`),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bscmainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, "https://goerli.infura.io/v3/" + process.env.INFURA_KEY),
      network_id: 5,
      gas: 7500000,
      gasPrice: 5000000000, // 5 gwei,
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets)
      //from: process.env.DEPLOYER_ADDRESS
    },
    // main ethereum network(mainnet)
    live: {
      provider: () => new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY),
      network_id: 1,
      gas: 5500000,
      gasPrice: 2000000000 // 2 gwei
    },
    local: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
      skipDryRun: true,
      gasPrice: 5000000000
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0",  /// Final version of solidity-v0.5.x
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
