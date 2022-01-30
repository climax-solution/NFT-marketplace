import { applyMiddleware, compose, createStore } from "redux";
import reducer from "./reducer";
import thunk from 'redux-thunk';
const middelware = [thunk];
const store = createStore(
    reducer,
    compose(
        applyMiddleware(
            ...middelware
        )
    )
);
export default store;