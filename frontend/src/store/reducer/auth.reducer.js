import { SET_AUTH, SET_LOADING_PROCESS } from "../types";

const data = {
    user: {
        walletAddress: ''
    },
    isLoading: true
}

export default function AuthReducer(state = data, action) {
    switch(action.type) {
        case SET_AUTH:
            return { ...state, user: action.payload };
        
        case SET_LOADING_PROCESS:
            return { ...state, isLoading: action.payload };
            
        default:
            return state;
    }
}