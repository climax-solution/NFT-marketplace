import React, { useState, useEffect } from "react";
import Empty from "./Empty";

export default function FolderList({data, ...props}) {

    const [folderList, setFolderList] = useState([]);
    const [height, setHeight] = useState(0);

    const onImgLoad = ({target: img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(() => {
        setFolderList(data);
    },[data])

    return (
        <div className='row'>
            { folderList.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                    <div className="nft__item m-0 pb-4">
                        <div className="nft__item_wrap" style={{height: `${height}px`}}>
                            <a href={`/folder-explorer/${nft.folderIndex}`}>
                                <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                            </a>
                        </div>
                        <div className="nft__item_info mb-0">
                            <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                <h4>{nft.folder}</h4>
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {!folderList.length && <Empty/>}
            
        </div>
    )
}