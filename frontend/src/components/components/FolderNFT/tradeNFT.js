import axios from "axios";
import { lazy, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { NotificationManager } from "react-notifications";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { createGlobalStyle } from "styled-components";
import Swal from "sweetalert2";
import { UPDATE_LOADING_PROCESS } from "../../../store/action/auth.action";
import getWeb3 from "../../../utils/getWeb3";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const Clock = lazy(() => import("../Clock"));

const GlobalStyles = createGlobalStyle`
    .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
    .owner-check {
        position: absolute;
        right: 15px;
        top: 15px;
        font-size: 25px !important;
        color: turquoise;
    }

    .bid-check {
        position: absolute;
        right: 15px;
        bottom: 15px;
        font-size: 25px !important;
        color: turquoise;
    }

    .wap-height {
        height: calc(100% - 120px);
    }
`;

export default function TradeNFT({ data }) {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const userData = useSelector((state) => state.auth.user);

    const [nft, setNFT] = useState(data);
    const [web3, setWeb3] = useState();
    const [Marketplace, setMarketplace] = useState();
    const [isLoading, setLoading] = useState(true);

    const [price, setPrice] = useState();
    const [isNFTOwner, setNFTOwner] = useState(false);
    const [isBidOwner, setBidOwner] = useState(false);
    const [claimable, setClaimable] = useState(false);

    useEffect(async() => {
        const { _web3, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setMarketplace(instanceMarketplace);

        await axios.get(`${data.nftData.tokenURI}`).then(res => {
            const { data: metadata } = res;
            setNFT({ ...nft, ...metadata });
            const _price = !nft.auctionData.existance ? nft.marketData.price : (Number(nft.auctionData.currentBidPrice) ? nft.auctionData.currentBidPrice : nft.auctionData.minPrice);
            const nftOwner =( (nft.nftData.owner).toLowerCase() == (userData.walletAddress).toLowerCase());
            const bidOwner = (nft.auctionData.currentBidOwner).toLowerCase() == (userData.walletAddress).toLowerCase();
            const _claimable = Date.parse(new Date(nft.auctionData.endAuction * 1000)) - Date.parse(new Date());
            
            setPrice(_price);
            setNFTOwner(nftOwner);
            setBidOwner(bidOwner);
            setClaimable(_claimable);
        });

        setLoading(false);
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    const buyNow = async(id) => {

        if (!userData.walletAddress) {
            NotificationManager.warning("Please log in");
            return;
        }

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        try {
            let { marketData, auctionData } = await Marketplace.methods.getItemNFT(id).call();
            if (marketData.marketStatus && !auctionData.existance) {
                const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);
                const _estGas = await Marketplace.methods.buyNFT(id).estimateGas({ from: userData.walletAddress, value: price})

                if (Number(marketData.price) + Number(_estGas) > Number(_bnbBalance)) throw new Error("BNB balance is not enough");

                await Marketplace.methods.buyNFT(id).send({ from: userData.walletAddress, value: marketData.price });

                const data = {
                    tokenID: id,
                    type: 0,
                    price: Number(marketData.price),
                    walletAddress: userData.walletAddress
                }

                await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

                }).catch(err => { });

                NotificationManager.success("Buy success");
            }
        } catch(err) {
            NotificationManager.error(err.message);
        }
    }

    const placeBid = async(id) => {

        if (!userData.walletAddress) {
            NotificationManager.warning("Please log in");
            return;
        }

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        let {auctionData} = await Marketplace.methods.getItemNFT(id).call();
        let lastPrice = web3.utils.fromWei(auctionData.currentBidPrice, "ether");
        if (!Number(lastPrice)) lastPrice = web3.utils.fromWei(auctionData.minPrice, "ether");
        if (auctionData.existance) {
           try {
                await Swal.fire({
                    title: '<span style="font-size: 22px">PLEASE ENTER PRICE</span>',
                    input: 'number',
                    width: 350,
                    inputAttributes: {
                    autocapitalize: 'off',
                    },
                    inputValidator: (value) => {
                        if (value <= lastPrice) return `Price must be greater than ${lastPrice} BNB.`;
                    },
                    color: '#000',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    showLoaderOnConfirm: true,
                    allowOutsideClick: () => !Swal.isLoading()
                }).then(async(res) => {
                    if (res.isConfirmed) {
                        const price = web3.utils.toWei(res.value, "ether");
                        const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);
                        const _estGas = await Marketplace.methods.placeBid(id).estimateGas({ from: userData.walletAddress, value: price})

                        if (Number(marketData.price) + Number(_estGas) > Number(_bnbBalance)) throw new Error("BNB balance is not enough");

                        dispatch(UPDATE_LOADING_PROCESS(true));
                        await Marketplace.methods.placeBid(id).send({ from: userData.walletAddress, value: price});
                        const data = {
                            tokenID: id,
                            type: 7,
                            price: Number(price),
                            walletAddress: userData.walletAddress
                        }
        
                        await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{
        
                        }).catch(err => { });
                        NotificationManager.success("Success Bid");
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    }
                });
            } catch(err) {
                NotificationManager.error(err.message);
                dispatch(UPDATE_LOADING_PROCESS(false));
           }
        }
    }

    const claimNFT = async(id) => {
        if (!userData.walletAddress) {
            NotificationManager.warning("Please log in");
            return;
        }

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        try {
            const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);
            const _estGas = await Marketplace.methods.claimNFT(id).estimateGas({ from: userData.walletAddress });

            if (Number(marketData.price) + Number(_estGas) > Number(_bnbBalance)) throw new Error("BNB balance is not enough");

            dispatch(UPDATE_LOADING_PROCESS(true));
            await Marketplace.methods.claimNFT(id).send({ from: userData.walletAddress });

        } catch(err) {
            NotificationManager.error(err.message);
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }

    return (
        <>
            <GlobalStyles/>
            {
                isLoading ? (
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
                                <span>
                                    <h4><Skeleton/></h4>
                                </span>
                                <span>
                                    <h4><Skeleton/></h4>
                                </span>
                            </div>
                        </div>
                    </div>
                )
                : (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                        <div className="nft__item m-0 pb-4 justify-content-between h-100">
                            {
                                nft.auctionData.existance &&
                                <div className="de_countdown">
                                    <Clock deadline={nft.auctionData.endAuction * 1000} />
                                </div>
                            }
                            <div className="nft__item_wrap flex-column position-relative wap-height">
                                
                                {
                                    (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" role="button" onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)} alt=""/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.nftData.tokenID}`}/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                }

                                {
                                    isNFTOwner && 
                                    <span>

                                        <small data-tip data-for={`owner-${nft.nftData.tokenID}`} className="owner-check"><i className="fal fa-badge-check"/></small>
                                        <ReactTooltip id={`owner-${nft.nftData.tokenID}`} type='info' effect="solid">
                                            <span>Your NFT</span>
                                        </ReactTooltip>
                                    </span>
                                }
                                {
                                    isBidOwner && 
                                    <span>

                                        <a data-tip data-for={`bid-${nft.nftData.tokenID}`} className="bid-check"><i className="fal fa-clock"/></a>
                                        <ReactTooltip id={`bid-${nft.nftData.tokenID}`} type='info' effect="solid">
                                            <span>Pending Bid</span>
                                        </ReactTooltip>
                                    </span>
                                }

                            </div>
                            <div className="nft__item_info mb-0">
                                <span>
                                    <h4 onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)}>{nft.nftName}</h4>
                                </span>
                                <div className="nft__item_price">
                                    {web3.utils.fromWei(price, 'ether')}<span>BNB</span>
                                </div>
                                <div className="trade-btn-group mt-2">
                                    { !isNFTOwner && nft.marketData.marketStatus && (
                                        !nft.auctionData.existance
                                            ? <span className="btn-main w-100" onClick={() => buyNow(nft.nftData.tokenID)} >Buy Now</span>
                                            : (
                                                !isBidOwner ? <span className="btn-main w-100" onClick={() => placeBid(nft.nftData.tokenID)}>Place Bid</span> : (
                                                    claimable < 0 ?
                                                    <span className="btn-main w-100" onClick={() => claimNFT(nft.nftData.tokenID)}>Claim NFT</span>
                                                    : ""
                                                )
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}