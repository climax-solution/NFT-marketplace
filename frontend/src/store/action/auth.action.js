import { SET_AUTH, SET_LOADING_PROCESS } from "../types"

export const UPDATE_LOADING_PROCESS = (payload) => async dispatch => {
    dispatch({
        payload,
        type: SET_LOADING_PROCESS
    })
}

export const UPDATE_AUTH = (payload) => async dispatch => {
    dispatch({
        payload,
        type: SET_AUTH
    })
}