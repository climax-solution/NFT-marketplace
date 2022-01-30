import { WALLET_CONNECT } from "../action/types"

const status = {
    wallet_connected: null
}

export default function (state = status, action) {
    switch(action.type) {
        case WALLET_CONNECT:
            return {...state, wallet_connected: action.payload}
        default:
            return {...state};
    }
}