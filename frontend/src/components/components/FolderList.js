import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Empty from "./Empty";
import Loading from "./Loading/Loading";
import Folder from "./Folder";

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
        // let newList = [];
        // for await (let item of list) {
        //     const URI = await NFT.methods.tokenURI(item.wide[0]).call();
        //     await axios.get(URI).then(res => {
        //         newList.push({ ...item, ...res.data});
        //     }).catch(err => { })
        // }
        setFolderList([ ...folderList, ...list ]);
        if (restList.length > 8) {
            setRestList(restList.slice(8, restList.length));
        }
        else setRestList([]);
    }

    
    return (
        <>
            {!loaded && <Loading/>}
            <InfiniteScroll
                dataLength={folderList.length}
                next={fetchFolders}
                hasMore={restList.length ? true : false}
                loader={<Loading/>}
                className="row"
            >
                { folderList.map( (nft, index) => (
                    <Folder init_nft={nft} NFT={NFT}/>
                ))}
            </InfiniteScroll>
            {!folderList.length && !restList.length && loaded && <Empty/>}
            
        </>
    )
}