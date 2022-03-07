import { lazy, Suspense, useEffect, useState } from "react";
import axios from "axios";
import Skeleton from 'react-loading-skeleton'
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import ItemLoading from "./Loading/ItemLoading";

const MusicArt = lazy(() => import("./Asset/music"));
const VideoArt = lazy(() => import("./Asset/video"));

const GlobalStyles = createGlobalStyle`
   .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

const Folder = (props) => {

    const navigate = useNavigate();

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
            <Suspense fallback={<ItemLoading/>}>
                <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                    <div className="nft__item m-0 pb-4 h-100 justify-content-between">
                        <div className="nft__item_wrap ratio-1x1">
                            {
                                loading ? (
                                    <span>
                                        <Skeleton className="lazy nft__item_preview ratio ratio-1x1"/>
                                    </span>
                                ) :
                                <>
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} className="lazy nft__item_preview" onClick={() => navigate(`/folder-explorer/${nft.folderIndex}`)} role="button" alt=""/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/folder-explorer/${nft.folderIndex}`}/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                    }
                                </>
                            }
                        </div>
                        <div className="nft__item_info mb-0 mt-1">
                            <span>
                                <h4>
                                    {
                                        loading ? <Skeleton/> : <span onClick={() => navigate(`/folder-explorer/${nft.folderIndex}`)} className="text-white">{nft.folder}</span>}</h4>
                            </span>
                        </div>
                    </div>
                </div>
            </Suspense>
        </>
    )
}

export default Folder;