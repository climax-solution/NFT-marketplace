import {WALLET_CONNECT } from './types';

export const WalletConnect = () => async dispatch => {
    let wallet_connected = window.localStorage.getItem("nftdevelopments-connected");
    const wallet = JSON.parse(wallet_connected);
    dispatch({
        type: WALLET_CONNECT,
        payload: wallet.connected
    });
}
