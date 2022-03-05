import React, { useEffect, useState, lazy, Suspense } from "react";
import { createGlobalStyle } from 'styled-components';
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import axios from "axios";
import Attr from "../components/ItemDetails/attributes";
import MusicArt from "../components/Asset/music";
import VideoArt from "../components/Asset/video";
import Loading from "../components/Loading/Loading";

const Clock = lazy(() => import("../components/Clock"));
const Footer = lazy(() => import('../components/footer'));
const Empty = lazy(() => import("../components/Empty"));
const ItemDetailsLoading = lazy(() => import("../components/Loading/ItemDetailsLoading"));

const GlobalStyles = createGlobalStyle`
  .border-grey {
      border-color: #4e4e4e !important;
  }
`;

const NFTItem = function() {

    const params = useParams();
    const [nft, setNFTData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(async() => {
        const { instanceMarketplace: Marketplace } = await getWeb3();
        try {
            const { id } = params;
            const item = await Marketplace.methods.getItemNFT(id).call();
            await axios.get(item.nftData.tokenURI).then(async(res) => {
                const { data } = res;
                setNFTData({ ...item, ...data });
            }).catch(err => {

            })
        } catch(err) {
            console.log(err);
            setNFTData({});
        }
        setLoading(false);
    },[])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <div>
            <Suspense fallback={<Loading/>}>
                <GlobalStyles/>
                <section className='jumbotron breadcumb no-bg'>
                    <div className='mainbreadcumb'>
                        <div className='container'>
                            <div className='row m-10-hor'>
                            <div className='col-12'>
                                <h1 className='text-center'>NFT Description</h1>
                            </div>
                            </div>
                        </div>
                    </div>
                </section>
                {
                    loading && <ItemDetailsLoading/>
                }
                {
                    !loading && (
                        Object.keys(nft).length ?
                            <section className='container'>
                                <div className='row mt-md-5 pt-md-4'>

                                <div className="col-md-6 col-sm-12">
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="img-fluid img-rounded mb-sm-30" alt=""/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={``}/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                    }
                                </div>
                                <div className="col-md-6 col-sm-12">
                                    <div className="item_info">
                                        {
                                            nft.auctionData.existance && (
                                                <>
                                                    Auctions ends in 
                                                    <div className="de_countdown">
                                                        <Clock deadline={nft.auctionData.endAuction * 1000} />
                                                    </div>
                                                </>
                                            )
                                        }
                                        <h2>{nft.nftName}</h2>
                                        <h5>TOKEN ID : {nft.nftData.tokenID}</h5>
                                        <div className="item_info_counts">
                                            <div className="item_info_type"><i className="fa fa-image"></i>{nft.category}</div>
                                        </div>
                                        <p>{nft.nftDesc}</p>

                                        <div className="spacer-40"></div>
                                        <Attr data={nft.attributes}/>
                                    </div>
                                </div>

                                </div>
                            </section>
                        : !Object.keys(nft).length && <Empty/>
                    )
                }
                <Footer />
            </Suspense>
        </div>
    );
}
export default NFTItem;