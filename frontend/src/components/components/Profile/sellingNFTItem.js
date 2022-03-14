import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import getWeb3 from "../../../utils/getWeb3";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));

export default function NFTItem({ data, NFT, Marketplace, remove }) {

    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [isTrading, setTrading] = useState(false);

    const navigate = useNavigate();

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const putDownSale = async (id) => {

        let message = "";

        if (!initialUser.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        
        if (message) {
            toast.warning(message, {
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

        setTrading(true);
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
            await axios.post('http://localhost:7060/activity/create-log', data).then(res =>{

            }).catch(err => { });
            await remove();
        } catch(err) {
            let message = "";
            if (err?.code == 4001) message = "Cancelled";
            else message = "Failed";

            toast.error(message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });

            if (err.code != 4001) {
                await refresh();
            }
        }
        setTrading(false);
    }

    const putDownAuction = async (id) => {

        let message = "";
        if (!initialUser.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        
        if (message) {
            toast.warning(message, {
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

        setTrading(true);
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
                setTrading(false);
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
            await axios.post('http://localhost:7060/activity/create-log', data).then(res =>{

            }).catch(err => { });
            remove();
        } catch(err) {
            let message = "";
            if (err?.code == 4001) message = "Cancelled";
            else message = "Failed";

            toast.error(message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });

            if (err.code != 4001) {
                await refresh();
            }
        }
        setTrading(false);
    }
  
    const updatePremiumNFT = async (id, status) => {
       
        let message = "";
        if (!initialUser.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        
        if (message) {
            toast.warning(message, {
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

        setTrading(true);
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
            await axios.post('http://localhost:7060/activity/create-log', data).then(res =>{

            }).catch(err => { });
            remove();
        } catch(err) {
            let message = "";
            if (err?.code == 4001) message = "Cancelled";
            else message = "Failed";

            toast.error(message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });

            if (err.code != 4001) {
                await refresh();
            }
        }
        setTrading(false);
    }

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            let _nft = {};
            await axios.get(data.tokenURI).then(async(res) => {
                if (typeof (res.data) === 'object') _nft = { ...data, ...res.data };
                await axios.post('http://localhost:7060/sale/get-nft-item', {
                    tokenID: data.tokenID,
                    walletAddress: initialUser.walletAddress
                }).then(result => { _nft = { ..._nft, ...result.data}});
            }).catch(err => {

            });
            setNFT(_nft);
            setLoading(false);
        }
    },[data])

    const refresh = async() => {
        const _NFT = await NFT.methods.getItemNFT(nft.tokenID).call();
        console.log(_NFT);
        if ((_NFT.nftData.owner).toLowerCase() != (initialUser.walletAddress).toLowerCase()) await remove();
        else if (!_NFT.marketData.marketStatus) await remove();
        else {
            await axios.get(`${_NFT.tokenURI}`).then(res => {
                const { data: metadata } = res;
                setNFT({ ..._NFT, ...metadata });
            });
        }
        
    }

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <>
            {
                isLoading ? <ItemLoading/>
                : (
                    !Object.keys(nft).length ? ""
                    : (
                        <>
                            <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mt-3">
                                <div className="nft__item position-relative h-100 justify-content-between">
                                    {
                                        isTrading && 
                                        <div className="trade-loader start-0 w-100">
                                            <div className="nb-spinner"></div>
                                        </div>
                                    }
                                    <div className="nft__item_wrap">
                                        {
                                            (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" onClick={() => navigate(`/item-detail/${nft.tokenID}`) } role="button" alt=""/>
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
                                        <div className="nft__item_price">
                                            {web3.utils.fromWei(nft.price, "ether")} BNB
                                        </div>
                                        {/* <div className="pb-4 trade-btn-group mt-2">
                                            { nft.marketData.marketStatus && (
                                                !nft.auctionData.existance ?
                                                    <span className="btn-main w-100" onClick={() => putDownSale(nft.tokenID)}>Delist</span>
                                                    :<span className="btn-main w-100" onClick={() => putDownAuction(nft.tokenID)}>Delist auction</span>
                                                )
                                            }
                                            { !nft.marketData.premiumStatus ? <span className="btn-main mt-2 w-100" onClick={async() => await updatePremiumNFT(nft.tokenID, true)}>Promote to preimum</span> : <span className="btn-main mt-2 w-100"  onClick={() => updatePremiumNFT(nft.tokenID, false)}>Reset to normal</span> }
                                        </div> */}
                                    </div> 
                                </div>
                            </div>
                        </>
                    )
                )
            }
        </>
    )
}