const marketplace_addr = "0x9494E8308eCD76fCA05C3733e8c2782634185869";
const Web3 = require('web3');
const { SignTypedDataVersion, recoverTypedSignature } = require('@metamask/eth-sig-util');

const getWeb3 = async() => {
    const provider = new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    const _web3 = new Web3(provider);
    return { _web3 };
}

const listSign = async (nonce, tokenID, from, price, isPremium, signature) => {
    const msgParams = JSON.stringify({
        domain: {
          chainId: 97,
          name: 'NFT Developments Marketplace',
          verifyingContract: marketplace_addr,
          version: '1'
        },
    
        message: {
            nonce,
            from,
            tokenID,
            price,
            isPremium
        },
        primaryType: 'List',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          List: [
            { name: 'nonce', type: 'uint256' },
            { name: 'from', type: 'address' },
            { name: 'tokenID', type: 'uint256' },
            { name: 'price', type: 'uint256' },
            { name: 'isPremium', type: 'bool' },
          ],
        },
    });

    const { _web3 } = await getWeb3();
    const recovered = recoverTypedSignature({
        data: JSON.parse(msgParams),
        signature,
        version: SignTypedDataVersion.V3
    });
    console.log(nonce, tokenID, from, price, isPremium, signature);
    console.log(recovered);
    if (_web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from)) return _web3.utils.toChecksumAddress(recovered);
    return false;
}

const auctionSign = async (nonce, tokenID, from, price, deadline, isPremium, signature) => {
    const msgParams = JSON.stringify({
        domain: {
            chainId: 97,
            name: 'NFT Developments Marketplace',
            verifyingContract: marketplace_addr,
            version: '1'
        },
    
        message: {
            nonce,
            from,
            tokenID,
            price,
            deadline,
            isPremium
        },
        primaryType: 'List',
        types: {
            EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
            ],
            List: [
            { name: 'nonce', type: 'uint256' },
            { name: 'from', type: 'address' },
            { name: 'tokenID', type: 'uint256' },
            { name: 'price', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'isPremium', type: 'bool' },
            ],
        },
    });

    const { _web3 } = await getWeb3();
    const recovered = recoverTypedSignature({
        data: JSON.parse(msgParams),
        signature,
        version: SignTypedDataVersion.V3
    });

    if (_web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from)) return true;
    return false;
}

const deListSign = async (action, tokenID, from, price, isPremium, signature) => {
    const msgParams = JSON.stringify({
        domain: {
            chainId: 97,
            name: 'NFT Developments Marketplace',
            verifyingContract: marketplace_addr,
            version: '1'
        },
    
        message: {
            action,
            from,
            tokenID,
            price,
            isPremium
        },
        primaryType: 'DeList',
        types: {
            EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
            ],
            DeList: [
            {name: 'action', type: 'string'},
            { name: 'from', type: 'address' },
            { name: 'tokenID', type: 'uint256' },
            { name: 'price', type: 'uint256' },
            { name: 'isPremium', type: 'bool' },
            ],
        },
    });

    const { _web3 } = await getWeb3();
    const recovered = recoverTypedSignature({
        data: JSON.parse(msgParams),
        signature,
        version: SignTypedDataVersion.V3
    });

    if (_web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from)) return true;
    return false;
}

const offerSign = async (nonce, tokenID, from, price, signature) => {
    const msgParams = JSON.stringify({
        domain: {
          chainId: 97,
          name: 'NFT Developments Marketplace',
          verifyingContract: marketplace_addr,
          version: '1'
        },
    
        message: {
            nonce,
            from,
            tokenID,
            price
        },
        primaryType: 'Offer',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          Offer: [
            { name: 'nonce', type: 'uint256' },
            { name: 'from', type: 'address' },
            { name: 'tokenID', type: 'uint256' },
            { name: 'price', type: 'uint256' },
          ],
        },
    });

    const { _web3 } = await getWeb3();
    const recovered = recoverTypedSignature({
        data: JSON.parse(msgParams),
        signature,
        version: SignTypedDataVersion.V3
    });

    if (_web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from)) return true;
    return false;
}

const processOfferSign = async ( tokenID, from, price, signature) => {
    const action = 'remove';
    const msgParams = JSON.stringify({
        domain: {
            chainId: 97,
            name: 'NFT Developments Marketplace',
            verifyingContract: marketplace_addr,
            version: '1'
        },
    
        message: {
            action,
            from,
            tokenID,
            price
        },
        primaryType: 'Offer',
        types: {
            EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
            ],
            Offer: [
            { name: 'action', type: 'string'},
            { name: 'from', type: 'address' },
            { name: 'tokenID', type: 'uint256' },
            { name: 'price', type: 'uint256' },
            ],
        },
    });

    const { _web3 } = await getWeb3();
    const recovered = recoverTypedSignature({
        data: JSON.parse(msgParams),
        signature,
        version: SignTypedDataVersion.V3
    });

    if (_web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from)) return true;
    return false;
}

const authSign = async(account, action, signature) => {
    const msgParams = JSON.stringify({
        domain: {
          chainId: 56,
          name: 'NFT Developments Marketplace',
          verifyingContract: marketplace_addr,
          version: '1'
        },
    
        message: {
            action,
            account
        },
        primaryType: 'Auth',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          Auth: [
            { name: 'action', type: 'string'},
            { name: 'account', type: 'address' },
          ],
        },
    });
  
    const { _web3 } = await getWeb3();
    const recovered = recoverTypedSignature({
        data: JSON.parse(msgParams),
        signature,
        version: SignTypedDataVersion.V3
    });

    if (_web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(account)) return true;
    return false;
}
  
module.exports = {
    listSign,
    auctionSign,
    deListSign,
    offerSign,
    processOfferSign,
    authSign
};