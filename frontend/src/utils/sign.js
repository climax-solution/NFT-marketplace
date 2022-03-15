export default async function sign (nonce, tokenID, from, price, isPremium) {
    const msgParams = JSON.stringify({
        domain: {
          chainId: 3,
          name: 'NFT Developments Marketplace',
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          version: '1',
          salt: 'NFTD MARKETPLACE'
        },
    
        message: {
            nonce,
            from,
            tokenID,
            price,
            isPremium
        },
        primaryType: 'Group',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
            { name: 'salt', type: 'string'}
          ],
          Group: [
            { name: 'nonce', type: 'uint256' },
            { name: 'from', type: 'address' },
            { name: 'tokenID', type: 'uint256' },
            { name: 'price', type: 'uint256' },
            { name: 'isPremium', type: 'bool' },
          ],
        },
    });

    var params = [from, msgParams];
    var method = 'eth_signTypedData_v4';
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(
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