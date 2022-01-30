import {  combineReducers } from 'redux';
import authReducer from './auth.reducer';
import walletReducer from './wallet.reducer';

const reducer = combineReducers({
    wallet: walletReducer,
    auth: authReducer
})
export default reducer;