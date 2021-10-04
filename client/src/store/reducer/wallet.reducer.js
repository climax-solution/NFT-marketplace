import { WALLET_CONNECT } from "../action/types"

const status = {
    wallet_connected: false
}

export default function (state = status, action) {
    switch(action.type) {
        case WALLET_CONNECT:
            console.log('WALLLLLLLL', action);
            return {...state, wallet_connected: action.payload}
            break;
        default:
            return {...state};
            break;
    }
}