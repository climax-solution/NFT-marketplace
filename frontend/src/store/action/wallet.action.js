import {WALLET_CONNECT} from './types';

export const WalletConnect = () => async dispatch => {
    let wallet_connected = window.localStorage.getItem("nftdevelopments");
    const wallet = JSON.parse(wallet_connected);
    // console.log(wallet);
    dispatch({
        type: WALLET_CONNECT,
        payload: wallet.connected
    })
}