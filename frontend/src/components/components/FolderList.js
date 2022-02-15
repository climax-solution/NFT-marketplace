import axios from "axios";
import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Empty from "./Empty";
import Loading from "./Loading/Loading";
import ReactPlayer from 'react-player'

export default function FolderList({data, _insNFT }) {

    const [NFT, setNFT] = useState({});
    const [folderList, setFolderList] = useState([]);
    const [restList, setRestList] = useState([{},{}]);
    const [height, setHeight] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const onImgLoad = ({target: img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
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
        let newList = [];
        for await (let item of list) {
            const URI = await NFT.methods.tokenURI(item.wide[0]).call();
            await axios.get(URI).then(res => {
                newList.push({ ...item, ...res.data});
            }).catch(err => { })
        }
        setFolderList([ ...folderList, ...newList ]);
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
                    <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                        <div className="nft__item m-0 pb-4">
                            <div className="nft__item_wrap" style={{height: `${height}px`}}>
                                <a href={`/folder-explorer/${nft.folderIndex}`}>
                                    
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() != "video") ? <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                                        :
                                        <ReactPlayer url={nft.asset} config={{ youtube: { playerVars: { origin: 'https://www.youtube.com' } } }} className="lazy nft__item_preview w-100" />
                                    }

                                </a>
                            </div>
                            <div className="nft__item_info mb-0 mt-1">
                                <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                    <h4><a href={`/folder-explorer/${nft.folderIndex}`} className="text-decoration-none text-white">{nft.folder}</a></h4>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
            {!folderList.length && !restList.length && loaded && <Empty/>}
            
        </>
    )
}