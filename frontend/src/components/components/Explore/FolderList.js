import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Empty from "../Empty";
import Folder from "./Folder";
import PremiumNFTLoading from "../Loading/PremiumNFTLoading";

export default function FolderList({data }) {

    const [folderList, setFolderList] = useState([]);
    const [restList, setRestList] = useState([{},{}]);
    const [loaded, setLoaded] = useState(false);

    useEffect(async() => {
        setFolderList([]);
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
        setFolderList([ ...folderList, ...list ]);
        if (restList.length > 8) {
            setRestList(restList.slice(8, restList.length));
        }
        else setRestList([]);
        setLoaded(false);
    }
    
    return (
        <>
            <InfiniteScroll
                dataLength={folderList.length}
                next={fetchFolders}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="row"
            >
                { folderList.map( (nft, index) => (
                    <Folder folderID={nft._id} key={index}/>
                ))}
            </InfiniteScroll>
            {!folderList.length && !restList.length && <Empty/>}
        </>
    )
}