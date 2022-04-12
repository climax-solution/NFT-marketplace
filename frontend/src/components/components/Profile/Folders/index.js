import axios from "axios";
import { useSelector } from "react-redux";
import React, { useState, useEffect, lazy } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const Empty = lazy(() => import("../../Empty"));
const Folder = lazy(() => import("./Item"));
const PremiumNFTLoading = lazy(() => import("../../Loading/PremiumNFTLoading"));

export default function FolderList() {

    const [folderList, setFolderList] = useState([]);
    const [restList, setRestList] = useState([{},{}]);
    const [loaded, setLoaded] = useState(false);

    const initialUser = useSelector(({ auth }) => auth.user);
    const [folders, setFolders] = useState([]);

    useEffect(async() => {
        const headers = JSON.parse(localStorage.getItem('nftdevelopments-token'));
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-list`, {artist: initialUser.username}).then(res => {
            const { list } = res.data;
            setRestList(list);
        }).catch(err => {

        })
        setFolderList([]);
        setLoaded(true);
    }, []);

    // useEffect(async() => {
    //     setFolderList([]);
    //     setRestList(data);
    //     setLoaded(true);
    // },[data])
    
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
    
    console.log(folderList, restList);

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