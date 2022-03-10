import axios from "axios";
import { lazy, Suspense, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ItemLoading from "../Loading/ItemLoading";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));

export default function NFTItem({ data }) {

    const navigate = useNavigate();

    const [nft, setNFT] = useState({});
    const [isLoading, setLoading] = useState(true);

    useEffect(async() => {
        await axios.get(data.nftData.tokenURI).then(res => {
            if (typeof res.data == 'object') setNFT({ ...data, ...res.data });
        }).catch(err => {})
        setLoading(false);
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }
      
    return (
        <>
            {
                isLoading && <ItemLoading/>
            }

            {
                !isLoading && (
                    Object.keys(nft).length ?
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-3">
                        <div className="nft__item h-100">
                            <div className="nft__item_wrap">
                                {
                                    (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)} alt=""/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.nftData.tokenID}`}/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                }
                            </div>
                            <div className="nft__item_info">
                                <span>
                                    <h4>{nft.nftName}</h4>
                                </span>
                            </div> 
                        </div>
                    </div>
                    : ""
                )
            }
        </>
    )
}