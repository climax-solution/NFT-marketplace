import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import getWeb3 from "../../../../utils/getWeb3";
import { toast } from "react-toastify";

const MusicArt = lazy(() => import("../../Asset/music"));
const VideoArt = lazy(() => import("../../Asset/video"));
const ItemLoading = lazy(() => import("../../Loading/ItemLoading"));
const AuctionSellModal = lazy(() => import("../../Modal/AuctionSellModal"));
const DirectSellModal = lazy(() => import("../../Modal/DirectSellModal"));

export default function NotSaleNFT({ data, NFT, Marketplace, remove }) {

    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [auctionVisible, setAuctionVisible] = useState(false);
    const [directVisible, setDirectVisible] = useState(false);
    const [activeID, setActiveID] = useState(-1);

    const navigate = useNavigate();

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            let _nft = {};
            await axios.get(data.tokenURI).then(async(res) => {
                if (typeof (res.data) === 'object') _nft = { ...data, ...res.data };
                // await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, {
                //     tokenID: data.tokenID,
                //     walletAddress: initialUser.walletAddress
                // }).then(result => { _nft = { ..._nft, ...result.data}});
            }).catch(err => {

            });
            setNFT(_nft);
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
        <div className="d-item col-lg-3 col-md-6 col-sm-6 mt-2 col-xs-12">
            {
                isLoading ? <ItemLoading/>
                : (
                    <>
                        <div className="nft__item h-100 justify-content-between">
                            <div className="nft__item_wrap w-100 ratio-1-1">
                                {
                                    (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} role="button" className="lazy nft__item_preview ratio-1-1" onClick={() => navigate(`/item-detail/${nft.tokenID}`)} alt=""/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.tokenID}`}/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                }
                            </div>
                            <div className="nft__item_info">
                                <span>
                                    <h4 onClick={() => !isLoading ? navigate(`/item-detail/${nft.tokenID}`) : null }>{ nft.nftName }</h4>
                                </span>
                                {/* <div className="nft__item_price">{ web3.utils.fromWei(nft.marketData.price, "ether")} BNB </div> */}
                                <div className="pb-4 trade-btn-group mt-2">
                                    <span className="btn-main w-100" onClick={() => listOnSale(nft.tokenID)}>List</span>
                                    <span className="btn-main w-100 mt-2" onClick={() => listOnAuction(nft.tokenID)}>List on auction</span>
                                </div>
                            </div> 
                        </div>
                        {
                            auctionVisible && <AuctionSellModal
                                visible={auctionVisible}
                                close={
                                    (status = false) => {
                                        if (status) remove();
                                        setAuctionVisible(false)
                                    }
                                }
                                Marketplace={Marketplace}
                                NFT={NFT}
                                web3={web3}
                                tokenID={activeID}
                            />
                        }
                        {
                            directVisible && <DirectSellModal
                                visible={directVisible}
                                close={
                                    (status = false) => {
                                        if (status) remove();
                                        setDirectVisible(false)
                                    }
                                }
                                Marketplace={Marketplace}
                                NFT={NFT}
                                web3={web3}
                                tokenID={activeID}
                            />
                        }
                    </>
                )
            }
        </div>
    )
}