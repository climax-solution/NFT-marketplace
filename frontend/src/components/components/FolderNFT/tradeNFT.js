import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { createGlobalStyle } from "styled-components";
import Modal from 'react-awesome-modal';
import getWeb3 from "../../../utils/getWeb3";
import { toast } from "react-toastify";

const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));
const ItemLoading = lazy(() => import("../Loading/ItemLoading"));
const Clock = lazy(() => import("../Clock"));

const GlobalStyles = createGlobalStyle`
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
    
    const navigate = useNavigate();

    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const userData = useSelector((state) => state.auth.user);

    const [nft, setNFT] = useState(data);
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
            setNFT({ ...nft, ...metadata });
            const _price = !nft.auctionData.existance ? nft.marketData.price : (Number(nft.auctionData.currentBidPrice) ? nft.auctionData.currentBidPrice : nft.auctionData.minPrice);
            const nftOwner =( (nft.nftData.owner).toLowerCase() == (userData.walletAddress).toLowerCase());
            const bidOwner = (nft.auctionData.currentBidOwner).toLowerCase() == (userData.walletAddress).toLowerCase();
            const _claimable = Date.parse(new Date(nft.auctionData.endAuction * 1000)) - Date.parse(new Date());
            
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

        if (!userData.walletAddress) {
            toast.warning('Please log in', {
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

        if (!wallet_info) {
            toast.warning('Please connect metamask', {
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

        if (!userData.walletAddress) {
            toast.warning('Please log in', {
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

        if (!wallet_info) {
            toast.warning('Please connect metamask', {
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

        let {auctionData} = await Marketplace.methods.getItemNFT(nft.nftData.tokenID).call();
        let lastPrice = web3.utils.fromWei(auctionData.currentBidPrice, "ether");

        if (!Number(lastPrice)) lastPrice = web3.utils.fromWei(auctionData.minPrice, "ether");
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
                setTrading(false);
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
                setTrading(false);
           }
        }
    }

    const claimNFT = async() => {
        if (!userData.walletAddress) {
            toast.warning('Please log in', {
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

        if (!wallet_info) {
            toast.warning('Please connect metamask', {
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

    return (
        <>
            <GlobalStyles/>
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
                                            ? <span className="btn-main w-100" onClick={() => buyNow(nft.nftData.tokenID)} >Buy Now</span>
                                            : (
                                                !isBidOwner ? <span className="btn-main w-100" onClick={() => setVisible(true)}>Place Bid</span> : (
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
                        {
                            isTrading && 
                            <div className="trade-loader">
                                <div class="nb-spinner"></div>
                            </div>
                        }

                        <Modal
                            visible={visible}
                            width="300"
                            height="200"
                            effect="fadeInUp"
                            onClickAway={() => setVisible(false)}
                        >
                            <div className='p-5'>
                                <div className='form-group'>
                                    <label>Please input price.</label>
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
                                    >Pleace Bid</button>
                                    <button
                                        className='btn-main w-100'
                                        onClick={close}
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