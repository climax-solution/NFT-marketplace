import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from 'react-loading-skeleton'
import { createGlobalStyle } from 'styled-components';
import ReactPlayer from 'react-player'
import MusicArt from "./Asset/music";
import VideoArt from "./Asset/video";

const GlobalStyles = createGlobalStyle`
   .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

const Folder = (props) => {

    const [nft, setNFT] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(async() => {
        if (props?.Marketplace) {
            const { init_nft, Marketplace } = props;
            const URI = await Marketplace.methods.getItemNFT(init_nft.wide[0]).call();
            await axios.get(URI.nftData.tokenURI).then(res => {
                setNFT({ ...init_nft, ...URI, ...res.data});
            }).catch(err => {
                console.log(err);
            })
            setLoading(false);
        }
    },[props])

    return (
        <>
        <GlobalStyles/>
            {
                loading ? 
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 pb-3">
                        <div className="nft__item">
                            <div className="nft__item_wrap">
                                <span>
                                    <Skeleton className="lazy nft__item_preview ratio ratio-1x1"/>
                                </span>
                            </div>
                            <div className="nft__item_info">
                                <span>
                                    <h4><Skeleton/></h4>
                                </span>
                            </div>
                        </div>
                    </div>
                :
                <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                    <div className="nft__item m-0 pb-4 h-100 justify-content-between">
                        <div className="nft__item_wrap ratio-1x1">
                            
                            {
                                (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <a href={`/folder-explorer/${nft.folderIndex}`}><img src={nft.image} className="lazy nft__item_preview" alt=""/></a>
                            }

                            {
                                (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/folder-explorer/${nft.folderIndex}`}/>
                            }

                            {
                                (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                            }
        
                        </div>
                        <div className="nft__item_info mb-0 mt-1">
                            <span>
                                <h4><a href={`/folder-explorer/${nft.folderIndex}`} className="text-decoration-none text-white">{nft.folder}</a></h4>
                            </span>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default Folder;