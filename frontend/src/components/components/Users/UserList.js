import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from "styled-components";

import Empty from "../Empty";
import User from "./User";
import PremiumNFTLoading from "../Loading/PremiumNFTLoading";

const GlobalStyles = createGlobalStyle`
    .user-card {
        display: inline-block;
        max-width: 250px;
        height: 300px;
        border-radius: 10px;
        padding: 40px 20px;
        background: rgba(56,51,51,0.15);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
        -webkit-backdrop-filter: blur(9.4px);
        backdrop-filter: blur(9.4px);
        -webkit-backdrop-filter: blur(9.4px);
        flex: 1 0 250px;
        box-sizing: border-box;
        margin: 0.25em !important;
        border: 1px solid rgba(56,51,51,0.15);

        .avatar img{
            width: 110px;
            hegith: 110px;
            border-radius: 50%;
        }

        @media screen and (min-width: 1000px) and (max-width: 1300px) {
            max-width: calc(25% - 1em);
        }
    
        @media screen and (min-width: 600px) and (max-width: 1000px) {
            max-width: calc(50% - 1em);
        }
    }

    @media screen and (max-width: 600px) {
        .user-list {
            justify-content: center;
        }
    }
`;

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
        if (list.length > 8) {
            list = list.slice(0, 8);
        }
        setUserList([ ...userList, ...list ]);
        if (restList.length > 8) {
            setRestList(restList.slice(8, restList.length));
        }
        else setRestList([]);
        setLoaded(false);
    }
    
    return (
        <>
            <GlobalStyles/>
            <InfiniteScroll
                dataLength={userList.length}
                next={fetchFolders}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="d-flex flex-wrap user-list"
            >
                { userList.map( (user, index) => (
                    <User data={user} key={index}/>
                ))}
            </InfiniteScroll>
            {!userList.length && !restList.length && <Empty/>}
        </>
    )
}