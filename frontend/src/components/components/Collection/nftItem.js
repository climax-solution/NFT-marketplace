import axios from "axios";
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";

export default function NFTItem({ data }) {

    const [nft, setNFT] = useState(data);
    const [isLoading, setLoading] = useState(true);

    useEffect(async() => {
        await axios.get(nft.nftData.tokenURI).then(res => {
            setNFT({ ...nft, ...res.data });
        })
        setLoading(false);
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }
      
    return (
        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-3">
            <div className="nft__item h-100">
                <div className="nft__item_wrap">
                    {
                        isLoading ? (
                            <span>
                                <Skeleton className="lazy nft__item_preview ratio ratio-1x1"/>
                            </span>
                        )
                        :
                        <>
                            {
                                (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <a href={`/item-detail/${nft.nftData.tokenID}`}><img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" alt=""/></a>
                            }

                            {
                                (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.nftData.tokenID}`}/>
                            }

                            {
                                (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                            }
                        </>
                    }
                </div>
                <div className="nft__item_info">
                    <span>
                        <h4>{ isLoading ? nft.nftName : <Skeleton/>}</h4>
                    </span>
                </div> 
            </div>
        </div>
    )
}