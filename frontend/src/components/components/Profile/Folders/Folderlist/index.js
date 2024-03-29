import axios from "axios";
import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Empty from "../../../Empty";
import Folder from "./Item";
import PremiumNFTLoading from "../../../Loading/PremiumNFTLoading";

export default function FolderList() {

    const [folderList, setFolderList] = useState([]);
    const [restList, setRestList] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const initialUser = useSelector(({ auth }) => auth.user);

    useEffect(async() => {
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-list`, {artist: initialUser.username}).then(res => {
            const { list } = res.data;
            setRestList(list);
            setFolderList([]);
            setLoaded(true);
        }).catch(err => {
            setRestList([]);
            setFolderList([]);
            setLoaded(true);
        })
        
    }, []);

    useEffect(async() => {
        if (loaded) {
            await fetchFolders();
        }
    },[restList, loaded])

    const fetchFolders = async() => {
        let list = restList;
        if (list.length > 48) {
            list = list.slice(0, 48);
        }
        setFolderList([ ...folderList, ...list ]);
        if (restList.length > 48) {
            setRestList(restList.slice(48, restList.length));
        }
        else setRestList([]);
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
            { loaded && !folderList.length && !restList.length && <Empty/> }
            {
                !loaded && <PremiumNFTLoading/>
            }
        </>
    )
}