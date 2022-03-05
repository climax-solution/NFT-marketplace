import React, { useEffect, useState, lazy, Suspense } from "react";
import { createGlobalStyle } from 'styled-components';
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import axios from "axios";

import Loading from "../components/Loading/Loading";
import { NotificationManager } from "react-notifications";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import { useDispatch, useSelector } from "react-redux";

const Clock = lazy(() => import("../components/Clock"));
const Footer = lazy(() => import('../components/footer'));
const Empty = lazy(() => import("../components/Empty"));
const Attr = lazy(() => import("../components/ItemDetails/attributes"));
const MusicArt = lazy(() => import("../components/Asset/music"));
const VideoArt = lazy(() => import("../components/Asset/video"));

const ItemDetailsLoading = lazy(() => import("../components/Loading/ItemDetailsLoading"));

const GlobalStyles = createGlobalStyle`
    .border-grey {
        border-color: #4e4e4e !important;
    }
    .mw-500px {
        max-width: 500px;
    }
`;

const NFTItem = function() {

    const params = useParams();
    const dispatch = useDispatch();

    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const userData = useSelector((state) => state.auth.user);

    const [nft, setNFTData] = useState();
    const [web3, setWeb3] = useState();
    const [Marketplace, setMarketplace] = useState();
    const [loading, setLoading] = useState(true);
 
    const [price, setPrice] = useState();
    const [isNFTOwner, setNFTOwner] = useState(false);
    const [isBidOwner, setBidOwner] = useState(false);
    const [claimable, setClaimable] = useState(false);

    useEffect(async() => {
        const { _web3, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setMarketplace(instanceMarketplace);
        try {
            const { id } = params;
            const item = await instanceMarketplace.methods.getItemNFT(id).call();
            await axios.get(item.nftData.tokenURI).then(async(res) => {
                const { data } = res;
                setNFTData({ ...item, ...data });
                const _price = !item.auctionData.existance ? item.marketData.price : (Number(item.auctionData.currentBidPrice) ? item.auctionData.currentBidPrice : item.auctionData.minPrice);
                const nftOwner =( (item.nftData.owner).toLowerCase() == (userData.walletAddress).toLowerCase());
                const bidOwner = (item.auctionData.currentBidOwner).toLowerCase() == (userData.walletAddress).toLowerCase();
                const _claimable = Date.parse(new Date(item.auctionData.endAuction * 1000)) - Date.parse(new Date());
                
                setPrice(_price);
                setNFTOwner(nftOwner);
                setBidOwner(bidOwner);
                setClaimable(_claimable);
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

                dispatch(UPDATE_LOADING_PROCESS(true));
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
            console.log(err);
            NotificationManager.error(err.message);
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
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
                    }
                });
            } catch(err) {
                NotificationManager.error(err.message);
           }
           dispatch(UPDATE_LOADING_PROCESS(true));

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

                                    { !isNFTOwner && nft.marketData.marketStatus && (
                                        !nft.auctionData.existance
                                            ? <span className="btn-main py-3 mx-auto w-100 mt-3 mw-500px" onClick={() => buyNow(nft.nftData.tokenID)} >Buy Now</span>
                                            : (
                                                !isBidOwner ? <span className="btn-main py-3 w-50 mt-2" onClick={() => placeBid(nft.nftData.tokenID)}>Place Bid</span> : (
                                                    claimable < 0 ?
                                                    <span className="btn-main py-3 w-50 mt-2" onClick={() => claimNFT(nft.nftData.tokenID)}>Claim NFT</span>
                                                    : ""
                                                )
                                            )
                                        )
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
                                        <h5>TOKEN ID : {nft.nftData.tokenID} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PRICE : {web3.utils.fromWei(price.toString(), "ether")} BNB</h5>
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