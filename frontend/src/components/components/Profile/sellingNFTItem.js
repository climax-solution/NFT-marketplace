import axios from "axios";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UPDATE_LOADING_PROCESS } from "../../../store/action/auth.action";
import getWeb3 from "../../../utils/getWeb3";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));

export default function NFTItem({ data, NFT, Marketplace }) {

    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const putDownSale = async (id) => {

        if (!initialUser.walletAddress) {
            toast.warning('Please log in', {
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

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const buyAmount = nft.marketData.price;

            const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);

            if (Number(buyAmount / 40) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

            await Marketplace.methods.closeTradeToDirect(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 });

            const data = {
                tokenID: id,
                type: 2,
                price: buyAmount / 40,
                walletAddress: initialUser.walletAddress
            }
            toast.success('Success', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            }).catch(err => { });
        } catch(err) {
            console.log(id, "==>" ,err);
            toast.error('Failed', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }

    const putDownAuction = async (id) => {

        if (!initialUser.walletAddress) {
            toast.warning('Please log in', {
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

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            if (!web3.utils.toBN(nft.auctionData.currentBidOwner).isZero()) {
                toast.warning('There is existing bid', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
                dispatch(UPDATE_LOADING_PROCESS(false));
                return;
            }
            const buyAmount = nft.marketData.price;

            const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);

            if (Number(buyAmount / 40) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

            await Marketplace.methods.closeTradeToAuction(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 });
            const data = {
                tokenID: id,
                type: 6,
                price: buyAmount / 40,
                walletAddress: initialUser.walletAddress
            }
            toast.success('Success', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
              });
            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            }).catch(err => { });
        } catch(err) {
            console.log(id, "==>" ,err);
            toast.warning('Failed', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }
  
    const updatePremiumNFT = async (id, status) => {
        
        if (!initialUser.walletAddress) {
            toast.warning('Please log in', {
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

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const owner = await NFT.methods.ownerOf(id).call();
            if (owner.toLowerCase() != (initialUser.walletAddress).toLowerCase() && initialUser.walletAddress) throw "Not owner";
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const tax = nft.marketData.price;
            
            const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);

            if (Number(tax / 20) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

            await Marketplace.methods.updatePremiumStatus(id, status).send({ from: initialUser.walletAddress, value: tax / 20});

            const data = {
                tokenID: id,
                type: status ? 3 : 4,
                price: tax / 20,
                walletAddress: initialUser.walletAddress
            }
            toast.success('Success', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            }).catch(err => { });
        } catch(err) {
            if (typeof err == "string") {
                toast.error(err, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
            }
            else {
                toast.error('Failed', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
            }
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
        <Suspense fallback={<ItemLoading/>}>
            {
                isLoading ? <ItemLoading/>
                : (
                    !Object.keys(nft).length ? ""
                    : (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mt-3">
                            <div className="nft__item h-100 justify-content-between">
                                <div className="nft__item_wrap">
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`) } role="button" alt=""/>
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
                                    <div className="nft__item_price">
                                        {web3.utils.fromWei(nft.marketData.price, "ether")} BNB
                                    </div>
                                    <div className="pb-4 trade-btn-group mt-2">
                                        { nft.marketData.marketStatus && (
                                            !nft.auctionData.existance ?
                                                <span className="btn-main w-100" onClick={() => putDownSale(nft.nftData.tokenID)}>Delist</span>
                                                :<span className="btn-main w-100" onClick={() => putDownAuction(nft.nftData.tokenID)}>Delist from auction</span>
                                            )
                                        }
                                        { !nft.auctionData.existance && (!nft.marketData.premiumStatus ? <span className="btn-main mt-2 w-100" onClick={async() => await updatePremiumNFT(nft.nftData.tokenID, true)}>Promote to preimum</span> : <span className="btn-main mt-2 w-100"  onClick={() => updatePremiumNFT(nft.nftData.tokenID, false)}>Reset to normal</span>) }
                                    </div>
                                </div> 
                            </div>
                        </div>
                    )
                )
            }
        </Suspense>
    )
}