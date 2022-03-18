import { lazy, useEffect, useState } from "react";
import axios from "axios";
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import Empty from "../Empty";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));

const GlobalStyles = createGlobalStyle`
   .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

const Folder = ({ folderID }) => {

    const navigate = useNavigate();

    const [nft, setNFT] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(async() => {
        console.log('folderID', folderID)
        const _list = await axios.post('http://localhost:7060/folder/get-folder-interface', { folderID }).then(res => {
            const  { list } = res.data;
            console.log(list);
            return list;
        }).catch(err => {
            return {};
        });
        setNFT(_list);
        // await axios.get(URI.nftData.tokenURI).then(res => {
        //     setNFT({ ...init_nft, ...URI, ...res.data});
        // }).catch(err => {
        //     console.log(err);
        // })
        setLoading(false);
    },[folderID])

    console.group(nft);
    return (
        <>
            <GlobalStyles/>
            {
                loading ? <ItemLoading/>
                : (
                    Object.keys(nft).length ? (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                            <div className="nft__item m-0 pb-4 h-100 justify-content-between">
                                <div className="author_list_pp">
                                    <span onClick={()=> navigate(`/collection/${nft.folder.artist}`)}>                                    
                                        <img className="lazy" src={`http://localhost:7060/avatar/${nft.artistData.avatar}`} alt="" crossOrigin="true"/>
                                        <i className="fa fa-check"></i>
                                    </span>
                                </div>
                                <div className="nft__item_wrap ratio-1x1">
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={`/img/folder/${nft.folder.category}.png`} className="lazy nft__item_preview" onClick={() => navigate(`/folder-explorer/${nft.folderIndex}`)} role="button" alt=""/>
                                    }
                                </div>
                                <div className="nft__item_info mb-0 mt-1">
                                    <span>
                                        <h4>
                                            <span onClick={() => navigate(`/folder-explorer/${nft.folder._id}`)} className="text-white">{nft.folder.name}</span></h4>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : <Empty/>
                )
            }
        </>
    )
}

export default Folder;