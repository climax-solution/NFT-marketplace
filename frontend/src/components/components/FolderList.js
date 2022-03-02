import React, { useState, useEffect, lazy, Suspense } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const Empty = lazy(() => import("./Empty"));
const Loading = lazy(() => import("./Loading/Loading"));
const Folder = lazy(() => import("./Folder"));

export default function FolderList({data, _insNFT }) {

    const [NFT, setNFT] = useState({});
    const [folderList, setFolderList] = useState([]);
    const [restList, setRestList] = useState([{},{}]);
    const [loaded, setLoaded] = useState(false);

    useEffect(async() => {
        setNFT(_insNFT);
        setRestList(data);
        setLoaded(true);
    },[data])

    useEffect(async() => {
        if (loaded) await fetchFolders();
    },[loaded])

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
    }

    
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                {!loaded && <Loading/>}
                <InfiniteScroll
                    dataLength={folderList.length}
                    next={fetchFolders}
                    hasMore={restList.length ? true : false}
                    loader={<Loading/>}
                    className="row"
                >
                    { folderList.map( (nft, index) => (
                        <Folder init_nft={nft} NFT={NFT} key={index}/>
                    ))}
                </InfiniteScroll>
                {!folderList.length && !restList.length && loaded && <Empty/>}
            </Suspense>
        </>
    )
}