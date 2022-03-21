import getWeb3 from "./getWeb3";
import { marketplace_addr } from "../config/address.json";

export const listSign = async (nonce, tokenID, from, price, isPremium) => {
    const msgParams = JSON.stringify({
        domain: {
          chainId: 3,
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

    var params = [from, msgParams];
    var method = 'eth_signTypedData_v3';
    const { _web3 } = await getWeb3();
    return new Promise((resolve, reject) => {
      _web3.currentProvider.sendAsync(
            {
                method,
                params,
                from,
            },
            function (err, result) {
                if (err) reject(err);
                else if (result.error) reject(result.err);
                else if (result.result) resolve(result.result);
            }
        );
    });
}

export const auctionSign = async (nonce, tokenID, from, price, deadline, isPremium) => {
  const msgParams = JSON.stringify({
      domain: {
        chainId: 3,
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

  var params = [from, msgParams];
  var method = 'eth_signTypedData_v3';
  const { _web3 } = await getWeb3();
  return new Promise((resolve, reject) => {
    _web3.currentProvider.sendAsync(
          {
              method,
              params,
              from,
          },
          function (err, result) {
              if (err) reject(err);
              else if (result.error) reject(result.err);
              else if (result.result) resolve(result.result);
          }
      );
  });
}

export const deListSign = async (action, tokenID, from, price, isPremium) => {
  const msgParams = JSON.stringify({
      domain: {
        chainId: 3,
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

  var params = [from, msgParams];
  var method = 'eth_signTypedData_v3';
  const { _web3 } = await getWeb3();
  return new Promise((resolve, reject) => {
    _web3.currentProvider.sendAsync(
          {
              method,
              params,
              from,
          },
          function (err, result) {
              if (err) reject(err);
              else if (result.error) reject(result.err);
              else if (result.result) resolve(result.result);
          }
      );
  });
}

export const offerSign = async (nonce, tokenID, from, price) => {
    const msgParams = JSON.stringify({
        domain: {
          chainId: 3,
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

    var params = [from, msgParams];
    var method = 'eth_signTypedData_v3';
    const { _web3 } = await getWeb3();
    return new Promise((resolve, reject) => {
      _web3.currentProvider.sendAsync(
            {
                method,
                params,
                from,
            },
            function (err, result) {
                console.log("same", _web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from), _web3.utils.toChecksumAddress(recovered), _web3.utils.toChecksumAddress(from));
                if (err) reject(err);
                else if (result.error) reject(result.err);
                else if (result.result) resolve(result.result);
            }
        );
    });
}

export const processOfferSign = async ( tokenID, from, price) => {
  const action = 'remove';
  const msgParams = JSON.stringify({
      domain: {
        chainId: 3,
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

  var params = [from, msgParams];
  var method = 'eth_signTypedData_v3';
  const { _web3 } = await getWeb3();
  return new Promise((resolve, reject) => {
    _web3.currentProvider.sendAsync(
          {
              method,
              params,
              from,
          },
          function (err, result) {
              console.log("same", _web3.utils.toChecksumAddress(recovered) === _web3.utils.toChecksumAddress(from), _web3.utils.toChecksumAddress(recovered), _web3.utils.toChecksumAddress(from));
              if (err) reject(err);
              else if (result.error) reject(result.err);
              else if (result.result) resolve(result.result);
          }
      );
  });
}