import axios from "axios";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_LOADING_PROCESS } from "../../../store/action/auth.action";
import getWeb3 from "../../../utils/getWeb3";
import { toast } from "react-toastify";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));
const AuctionSellModal = lazy(() => import("../Modal/AuctionSellModal"));
const DirectSellModal = lazy(() => import("../Modal/DirectSellModal"));

export default function NotSaleNFT({ data, NFT, Marketplace }) {

    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [auctionVisible, setAuctionVisible] = useState(false);
    const [directVisible, setDirectVisible] = useState(false);
    const [activeID, setActiveID] = useState(-1);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            await axios.get(data.nftData.tokenURI).then(res => {
                setNFT({ ...data, ...res.data });
            }).catch(err => {

            })
            setLoading(false);
        }
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    const listOnSale = (id) => {
        if (!initialUser.walletAddress)
        if (!wallet_info) {
            toast.warning('Please connect metamask', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        setActiveID(id);
        setDirectVisible(true);
    }

    const listOnAuction = (id) => {
        if (!wallet_info) {
            toast.warning('Please connect metamask', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        setActiveID(id);
        setAuctionVisible(true);
    }

    return (
        <Suspense fallback={<ItemLoading/>}>
            {
                isLoading ? <ItemLoading/>
                : (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 mt-2 col-xs-12">
                        <div className="nft__item h-100 justify-content-between">
                            <div className="nft__item_wrap">
                                {
                                    (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} role="button" className="lazy nft__item_preview" onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)} alt=""/>
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
                                    <h4 onClick={() => !isLoading ? navigate(`/item-detail/${nft.nftData.tokenID}`) : null }>{ nft.nftName }</h4>
                                </span>
                                <div className="nft__item_price">{ web3.utils.fromWei(nft.marketData.price, "ether")} BNB </div>
                                <div className="pb-4 trade-btn-group mt-2">
                                    { !nft.marketData.marketStatus && <span className="btn-main w-100" onClick={() => listOnSale(nft.nftData.tokenID)}>List</span> }
                                    {!nft.auctionData.existance && <span className="btn-main w-100 mt-2" onClick={() => listOnAuction(nft.nftData.tokenID)}>List on auction</span> }
                                </div>
                            </div> 
                        </div>
                        {
                            auctionVisible && <AuctionSellModal
                                visible={auctionVisible}
                                close={() => setAuctionVisible(false)}
                                Marketplace={Marketplace}
                                NFT={NFT}
                                web3={web3}
                                tokenID={activeID}
                            />
                        }
                        {
                            directVisible && <DirectSellModal
                                visible={directVisible}
                                close={() => setDirectVisible(false)}
                                Marketplace={Marketplace}
                                NFT={NFT}
                                web3={web3}
                                tokenID={activeID}
                            />
                        }
                    </div>
                )
            }
        </Suspense>
    )
}