import React, { useState, useEffect, lazy, Suspense } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "./Loading/Loading";

const Empty = lazy(() => import("./Empty"));
const Folder = lazy(() => import("./Folder"));

export default function FolderList({data, _insMarketplace }) {

    const [Marketplace, setMarketplace] = useState({});
    const [folderList, setFolderList] = useState([]);
    const [restList, setRestList] = useState([{},{}]);
    const [loaded, setLoaded] = useState(false);

    useEffect(async() => {
        setMarketplace(_insMarketplace);
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
        <Suspense fallback={<Loading/>}>
            <InfiniteScroll
                dataLength={folderList.length}
                next={fetchFolders}
                hasMore={restList.length ? true : false}
                loader={<Loading/>}
                className="row"
            >
                { folderList.map( (nft, index) => (
                    <Folder init_nft={nft} Marketplace={Marketplace} key={index}/>
                ))}
            </InfiniteScroll>
            {!folderList.length && !restList.length && loaded && <Empty/>}
        </Suspense>
    )
}