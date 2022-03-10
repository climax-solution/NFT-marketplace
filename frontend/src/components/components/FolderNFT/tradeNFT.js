import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import Modal from 'react-awesome-modal';
import getWeb3 from "../../../utils/getWeb3";
import { toast } from "react-toastify";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));
const Clock = lazy(() => import("../Clock"));

export default function TradeNFT({ data }) {
    
    const navigate = useNavigate();

    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const userData = useSelector((state) => state.auth.user);

    const [nft, setNFT] = useState();
    const [web3, setWeb3] = useState();
    const [Marketplace, setMarketplace] = useState();
    const [isLoading, setLoading] = useState(true);
    const [isTrading, setTrading] = useState(false);
    const [visible, setVisible] = useState(false);

    const [nftPrice, setNFTPrice] = useState();
    const [bidPrice, setBidPrice] = useState();
    const [isNFTOwner, setNFTOwner] = useState(false);
    const [isBidOwner, setBidOwner] = useState(false);
    const [claimable, setClaimable] = useState(false);

    useEffect(async() => {
        const { _web3, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setMarketplace(instanceMarketplace);

        await axios.get(`${data.nftData.tokenURI}`).then(res => {
            const { data: metadata } = res;
            setNFT({ ...data, ...metadata });
            const _price = !data.auctionData.existance ? data.marketData.price : (Number(data.auctionData.currentBidPrice) ? data.auctionData.currentBidPrice : data.auctionData.minPrice);
            const nftOwner =( (data.nftData.owner).toLowerCase() == (userData.walletAddress).toLowerCase());
            const bidOwner = (data.auctionData.currentBidOwner).toLowerCase() == (userData.walletAddress).toLowerCase();
            const _claimable = Date.parse(new Date(data.auctionData.endAuction * 1000)) - Date.parse(new Date());
            
            setNFTPrice(_price);
            setNFTOwner(nftOwner);
            setBidOwner(bidOwner);
            setClaimable(_claimable);
        });

        setLoading(false);
    },[data])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    const buyNow = async() => {

        let message = "";
        if (!userData.walletAddress) message = "Please log in";
        else if (!wallet_info) message = 'Please connect metamask';

        if (message) {
            toast.warning(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        try {
            let { marketData, auctionData } = await Marketplace.methods.getItemNFT(nft.nftData.tokenID).call();
            if (marketData.marketStatus && !auctionData.existance) {
                const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);

                if (Number(marketData.price) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

                setTrading(true);

                await Marketplace.methods.buyNFT(nft.nftData.tokenID).send({ from: userData.walletAddress, value: marketData.price });

                const data = {
                    tokenID: nft.nftData.tokenID,
                    type: 0,
                    price: Number(marketData.price),
                    walletAddress: userData.walletAddress
                }

                await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

                }).catch(err => { });

                toast.success('Buy success', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
                await refresh();
            }
        } catch(err) {
            toast.error(err.message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        }
        setTrading(false);
    }

    const placeBid = async() => {

        let message = "";
        if (!userData.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        else if (bidPrice <= 0) message = 'Please reserve correct price';
        let {auctionData} = await Marketplace.methods.getItemNFT(nft.nftData.tokenID).call();
        if (bidPrice > 0) {
            let minPrice = web3.utils.fromWei(auctionData.minPrice, "ether");
            if (bidPrice < minPrice) message = 'Minimum price is ' + minPrice + 'BNB';
        }

        if (message) {
            toast.error(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        if (auctionData.existance) {
           try {
                const price = web3.utils.toWei(bidPrice.toString(), "ether");
                const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);

                if (Number(price) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

                setTrading(true);
                setVisible(false);
                setBidPrice('');
                await Marketplace.methods.placeBid(nft.nftData.tokenID).send({ from: userData.walletAddress, value: price});
                const data = {
                    tokenID: nft.nftData.tokenID,
                    type: 7,
                    price: Number(price),
                    walletAddress: userData.walletAddress
                }

                await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

                }).catch(err => { });
                toast.success("Success Bid", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
                await refresh();
            } catch(err) {
                toast.error(err.message, {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
            }
            setTrading(false);
        }
    }

    const claimNFT = async() => {
        let message = "";
        if (!userData.walletAddress) message = 'Please log in';

        if (!wallet_info) message = 'Please connect metamask';
        if (message) {
            toast.warning(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        try {
            const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);

            if (Number(_bnbBalance) < 210000 ) throw new Error("BNB balance is low");

            setTrading(true);
            await Marketplace.methods.claimNFT(nft.nftData.tokenID).send({ from: userData.walletAddress });
            toast.info("Success claim", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            await refresh();
        } catch(err) {
            toast.error(err.message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        }
        setTrading(false);
    }

    const withdrawBid = async() => {
        let message = "";
        if (!userData.walletAddress) message = 'Please log in';

        if (!wallet_info) message = 'Please connect metamask';
        if (message) {
            toast.warning(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        try {
            const _bnbBalance = await web3.eth.getBalance(userData.walletAddress);

            if (Number(_bnbBalance) < 210000 ) throw new Error("BNB balance is low");

            setTrading(true);
            await Marketplace.methods.withdrawBid(nft.nftData.tokenID).send({ from: userData.walletAddress });

            toast.info("Success withdraw", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            await refresh();
        } catch(err) {
            toast.error(err.message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        }
        setTrading(false);
    }

    const openModal = () => {
        let message = '';
        if (!userData.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        if (message) {
          toast.warning(message, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored"
          });
          return;
        }
        setVisible(true);
    }

    const refresh = async() => {
        const _NFT = await Marketplace.methods.getItemNFT(nft.nftData.tokenID).call();
        setLoading(true);
        await axios.get(`${_NFT.nftData.tokenURI}`).then(res => {
            const { data: metadata } = res;
            setNFT({ ..._NFT, ...metadata });
            const _price = !_NFT.auctionData.existance ? _NFT.marketData.price : (Number(_NFT.auctionData.currentBidPrice) ? _NFT.auctionData.currentBidPrice : _NFT.auctionData.minPrice);
            const nftOwner =( (_NFT.nftData.owner).toLowerCase() == (userData.walletAddress).toLowerCase());
            const bidOwner = (_NFT.auctionData.currentBidOwner).toLowerCase() == (userData.walletAddress).toLowerCase();
            const _claimable = Date.parse(new Date(_NFT.auctionData.endAuction * 1000)) - Date.parse(new Date());
            
            setNFTPrice(_price);
            setNFTOwner(nftOwner);
            setBidOwner(bidOwner);
            setClaimable(_claimable);
        });

        setLoading(false);
    }

    return (
        <>
            {
                isLoading ? <ItemLoading/>
                : (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4 position-relative">
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

                                {
                                    nft.marketData.premiumStatus && 
                                    <span>

                                        <a data-tip data-for={`premium-${nft.nftData.tokenID}`} className="premium-nft"><i className="fal fa-sparkles"/></a>
                                        <ReactTooltip id={`premium-${nft.nftData.tokenID}`} type='info' effect="solid">
                                            <span>Premium NFT</span>
                                        </ReactTooltip>
                                    </span>
                                }
                            </div>
                            <div className="nft__item_info mb-0">
                                <span>
                                    <h4 onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)}>{nft.nftName}</h4>
                                </span>
                                <div className="nft__item_price">
                                    {web3.utils.fromWei(nftPrice, 'ether')}<span>BNB</span>
                                </div>
                                <div className="trade-btn-group mt-2">
                                    { !isNFTOwner && nft.marketData.marketStatus && (
                                        !nft.auctionData.existance
                                            ? <span className="btn-main w-100" onClick={buyNow} >Buy Now</span>
                                            : (
                                                !isBidOwner ? (claimable > 0 && <span className="btn-main w-100" onClick={openModal}>Place Bid</span>) : (
                                                    claimable <= 0 ?
                                                    <span className="btn-main w-100" onClick={claimNFT}>Claim NFT</span>
                                                    : <span className="btn-main w-100" onClick={withdrawBid}>Withdraw Bid</span>
                                                )
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            isTrading && 
                            <div className="trade-loader">
                                <div className="nb-spinner"></div>
                            </div>
                        }

                        <Modal
                            visible={visible}
                            width="300"
                            height="200"
                            effect="fadeInUp"
                            onClickAway={null}
                        >
                            <div className='p-5'>
                                <div className='form-group'>
                                    <label>Please reserve price.</label>
                                    <input
                                        type="number"
                                        className='form-control text-dark border-dark'
                                        value={bidPrice}
                                        onChange={(e) => setBidPrice(e.target.value)}
                                    />
                                </div>
                                <div className='groups'>
                                    <button
                                        className='btn-main btn-apply w-100 px-1'
                                        onClick={placeBid}
                                    >Place</button>
                                    <button
                                        className='btn-main w-100'
                                        onClick={() => setVisible(false)}
                                    >Cancel</button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                )
            }
        </>
    )
}