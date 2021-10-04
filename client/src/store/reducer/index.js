import {  combineReducers } from 'redux';
import walletReducer from './wallet.reducer';

const reducer = combineReducers({
    wallet: walletReducer
})
export default reducer;