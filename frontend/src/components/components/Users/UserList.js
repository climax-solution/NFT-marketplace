import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from "styled-components";
import Empty from "../Empty";
import User from "./User";
import PremiumNFTLoading from "../Loading/PremiumNFTLoading";
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

export default function UserList({data}) {

    const [userList, setUserList] = useState([]);
    const [restList, setRestList] = useState([{},{}]);
    const [loaded, setLoaded] = useState(false);

    useEffect(async() => {
        setUserList([]);
        setRestList(data);
        setLoaded(true);
    },[data])

    useEffect(async() => {
        if (loaded) await fetchFolders();
    },[restList])

    const fetchFolders = async() => {
        let list = restList;
        if (list.length > 48) {
            list = list.slice(0, 48);
        }
        setUserList([ ...userList, ...list ]);
        if (restList.length > 48) {
            setRestList(restList.slice(48, restList.length));
        }
        else setRestList([]);
        setLoaded(false);
    }
    
    return (
        <>
            <GlobalStyle/>
            <InfiniteScroll
                dataLength={userList.length}
                next={fetchFolders}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="d-flex flex-wrap user-list row"
            >
                { userList.map( (user, index) => (
                    <User data={user} key={index}/>
                ))}
            </InfiniteScroll>
            {!userList.length && !restList.length && <Empty/>}
        </>
    )
}