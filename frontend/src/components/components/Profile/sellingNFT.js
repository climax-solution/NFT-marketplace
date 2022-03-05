import axios from "axios";
import { lazy, Suspense, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { NotificationManager } from "react-notifications";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { UPDATE_LOADING_PROCESS } from "../../../store/action/auth.action";
import getWeb3 from "../../../utils/getWeb3";
import Loading from "../Loading/Loading";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));

const GlobalStyles = createGlobalStyle`
   .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

export default function NFTItem({ data, Marketplace }) {

    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const putDownSale = async (id) => {

        if (!initialUser.walletAddress) {
            NotificationManager.warning("Please log in");
            return;
        }

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const buyAmount = nft.marketData.price;
            await Marketplace.methods.closeTradeToDirect(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 });

            const data = {
                tokenID: id,
                type: 2,
                price: buyAmount / 40,
                walletAddress: initialUser.walletAddress
            }
            NotificationManager.success("Success");
            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            });
        } catch(err) {
            console.log(id, "==>" ,err);
            NotificationManager.error("Failed");
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }

    const putDownAuction = async (id) => {

        if (!initialUser.walletAddress) {
            NotificationManager.warning("Please log in");
            return;
        }

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            if (!web3.utils.toBN(nft.auctionData.currentBidOwner).isZero()) {
                NotificationManager.warning("There is existing bid");
                dispatch(UPDATE_LOADING_PROCESS(false));
                return;
            }
            const buyAmount = nft.marketData.price;
            await Marketplace.methods.closeTradeToAuction(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 });
            const data = {
                tokenID: id,
                type: 6,
                price: buyAmount / 40,
                walletAddress: initialUser.walletAddress
            }
            await NotificationManager.success("Success");
            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            });
        } catch(err) {
            console.log(id, "==>" ,err);
            NotificationManager.error("Failed");
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }
  
    const updatePremiumNFT = async (id, status) => {
        
        if (!initialUser.walletAddress) {
            NotificationManager.warning("Please log in");
            return;
        }

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const owner = await NFT.methods.ownerOf(id).call();
            if (owner.toLowerCase() != (initialUser.walletAddress).toLowerCase() && initialUser.walletAddress) throw "Not owner";
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const tax = nft.marketData.price;
            await Marketplace.methods.updatePremiumStatus(id, status).send({ from: initialUser.walletAddress, value: tax / 20});

            const data = {
                tokenID: id,
                type: status ? 3 : 4,
                price: tax / 20,
                walletAddress: initialUser.walletAddress
            }
            NotificationManager.success("Success");
            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            });
        } catch(err) {
            console.log(err);
            if (typeof err == "string") NotificationManager.error(err);
            else NotificationManager.error("Failed");
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            await axios.get(data.nftData.tokenURI).then(res => {
                if (typeof (res.data) === 'object') setNFT({ ...data, ...res.data });
            }).catch(err => {

            })
            setLoading(false);
        }
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <>
            <GlobalStyles/>
            <Suspense fallback={<Loading/>}>
                {
                    (!isLoading && !Object.keys(nft).length) ? ""
                    : (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mt-3">
                            <div className="nft__item h-100 justify-content-between">
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
                                                (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`) } alt=""/>
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
                                        <h4 onClick={() => !isLoading ? navigate(`/item-detail/${nft.nftData.tokenID}`) : null }>{ isLoading ? <Skeleton/> : nft.nftName }</h4>
                                    </span>
                                    <div className="nft__item_price">
                                        { isLoading ? <Skeleton/> : <>{web3.utils.fromWei(nft.marketData.price, "ether")} BNB </>}
                                    </div>
                                    <div className="pb-4 trade-btn-group mt-2">
                                        {
                                            isLoading ? <Skeleton/>
                                            :
                                            <>
                                                { nft.marketData.marketStatus && (
                                                    !nft.auctionData.existance ?
                                                        <span className="btn-main w-100" onClick={() => putDownSale(nft.nftData.tokenID)}>Put down sale</span>
                                                        :<span className="btn-main w-100" onClick={() => putDownAuction(nft.nftData.tokenID)}>Put down auction</span>
                                                    )
                                                }
                                                { !nft.auctionData.existance && (!nft.marketData.premiumStatus ? <span className="btn-main mt-2 w-100" onClick={async() => await updatePremiumNFT(nft.nftData.tokenID, true)}>To Preimum</span> : <span className="btn-main mt-2 w-100"  onClick={() => updatePremiumNFT(nft.nftData.tokenID, false)}>To Normal</span>) }
                                            </>
                                        }
                                    </div>
                                </div> 
                            </div>
                        </div>
                    )
                }
            </Suspense>
            
        </>
    )
}