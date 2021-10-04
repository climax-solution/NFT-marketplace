import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";
import {WALLET_CONNECT} from './types';

export const WalletConnect = () => async dispatch => {
    const isProd = process.env.NODE_ENV === "production";
    if (!isProd) {
        // Get network provider and web3 instance.
        console.log('????','XSD');
        try {
            const web3 = await getWeb3('click');
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            const isMetaMask = web3.currentProvider.isMetaMask;
            console.log('MEATATAT', isMetaMask);
            if (isMetaMask) {
                dispatch({
                    type: WALLET_CONNECT,
                    payload: true
                })
            }
        }
        catch(err) {
            console.log(err);
        }
    }
}


export const SetStatus = (status) => dispatch => {
    dispatch({
        type: WALLET_CONNECT,
        payload: status
    })
}