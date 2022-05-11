import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Empty from "../Empty";
import User from "./User";
import PremiumNFTLoading from "../Loading/PremiumNFTLoading";
import "./style.css";

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