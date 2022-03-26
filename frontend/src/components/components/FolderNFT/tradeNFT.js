import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import Modal from 'react-awesome-modal';
import getWeb3 from "../../../utils/getWeb3";
import { toast } from "react-toastify";
import { offerSign, processOfferSign } from "../../../utils/sign";
import { marketplace_addr } from "../../../config/address.json";

const ItemLoading = lazy(() => import("../Loading/ItemLoading"));
const Clock = lazy(() => import("../Clock"));
const Art = lazy(() => import( "../Asset/art"));

export default function TradeNFT({ data, className = "mx-0" }) {
    
    const navigate = useNavigate();
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const initialUser = useSelector((state) => state.auth.user);

    const [nft, setNFTData] = useState();
    const [web3, setWeb3] = useState();
    const [Marketplace, setMarketplace] = useState();
    const [NFT, setNFT] = useState();
    const [isLoading, setLoading] = useState(true);
    const [isTrading, setTrading] = useState(false);
    const [visible, setVisible] = useState(false);

    const [nftPrice, setNFTPrice] = useState();
    const [bidPrice, setBidPrice] = useState();
    const [isNFTOwner, setNFTOwner] = useState(false);
    const [isBidOwner, setBidOwner] = useState(false);

    useEffect(async() => {
        const { _web3, instanceMarketplace, instanceNFT } = await getWeb3();
        setWeb3(_web3);
        setNFT(instanceNFT);
        setMarketplace(instanceMarketplace);
    },[])

    useEffect(async() => {
        if (Marketplace && data) {
            await refresh();
        }
    }, [data, Marketplace])

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    const buyNow = async() => {

        let message = "";
        if (!initialUser.walletAddress) message = "Please log in";
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
            setTrading(true);
            const { nft: _nft } = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID: nft.tokenID }).then(res => {
                return res.data;
            });

            if (_nft.action != 'list') throw Error();

            await Marketplace.methods.buy(_nft.tokenID, _nft.walletAddress, _nft.price, _nft.status == "premium" ? true : false, nft.signature).send({ from: initialUser.walletAddress, value: nft.price });
            toast.success("Buy success", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

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
        }
        await refresh();
        setTrading(false);
    }

    const placeBid = async() => {

        let message = "";
        let minPrice = web3.utils.fromWei(nftPrice, "ether");
        if (!initialUser.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        else if (bidPrice < minPrice) message = 'Minimum price is ' + minPrice + 'BNB';

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

        try {
            const price = web3.utils.toWei(bidPrice.toString(), "ether");
            setTrading(true);
            setVisible(false);
            setBidPrice('');
            
            const { instanceWBNB } = await getWeb3();
            const allowance = await instanceWBNB.methods.allowance(initialUser.walletAddress, marketplace_addr).call();
            if (allowance * 1 < price * 1) await instanceWBNB.methods.approve(marketplace_addr, price).send({ from : initialUser.walletAddress });
            const nonce = await Marketplace.methods.nonces(nft.tokenID).call();
            const result = await offerSign(nonce, nft.tokenID, initialUser.walletAddress, price);
  
            const offer = {
                nonce,
                tokenID: nft.tokenID,
                price,
                walletAddress: initialUser.walletAddress,
                signature: result
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/create-new-offer`, offer).then(res => {
                const { message } = res.data;
                toast.success(message, {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored"
                });
              }).catch(err => {
                const { error } = err.response.data;
                toast.success(error, {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored"
                });
            })
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

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
        }
        await refresh();
        setTrading(false);
    }

    const withdrawBid = async() => {
        let message = "";
        if (!initialUser.walletAddress) message = 'Please log in';

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
            
            setTrading(true);
            const signature = await processOfferSign(nft.tokenID, initialUser.walletAddress, nft.price);
            const withdraw = {
                walletAddress: initialUser.walletAddress,
                tokenID: nft.tokenID,
                signature
            };
            await axios.post(`${process.env.REACT_APP_BACKEND}sale/cancel-offer`, withdraw).then(res => {
                
                const { message } = res.data;
                toast.info(message, {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored"
                });
            });
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

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
        }
        await refresh();
        setTrading(false);
    }

    const openModal = () => {
        let message = '';
        if (!initialUser.walletAddress) message = 'Please log in';
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

        setLoading(true);
        let _orgNFT = await NFT.methods.getItemNFT(data.tokenID).call();
        _orgNFT = { ...data, ..._orgNFT};
        const saled = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID: data.tokenID }).then(res => {
            return res.data;
        }).catch(err => {
            return {
                nft: {}, childList: []
            }
        })

        if (saled.nft?.walletAddress) {
            if ((_orgNFT.owner).toLowerCase() != (saled.nft.walletAddress).toLowerCase()) {
                await axios.post(`${process.env.REACT_APP_BACKEND}sale/delist`, {
                    tokenID: saled.nft.tokenID
                }).catch(err => {

                });
            }
        }

        await axios.get(`${_orgNFT.tokenURI}`).then(res => {
            const { data: metadata } = res;
            const nftOwner = ( (_orgNFT.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase());
            setNFTOwner(nftOwner);

            if ((_orgNFT.owner).toLowerCase() == (saled.nft.walletAddress)?.toLowerCase()) {
                const _price = saled.nft.price;
                const existedBid = saled.nft.action == 'auction' ? saled.childList.filter(item => (item.walletAddress).toLowerCase() == (initialUser.walletAddress).toLowerCase()) : [];
                const bidOwner = existedBid.length ? true : false;
                
                setNFTData({ ..._orgNFT, ...metadata, ...saled.nft });
                setNFTPrice(_price);
                setBidOwner(bidOwner);
            }
            else setNFTData({ ..._orgNFT, ...metadata });
        }).catch(err => {
        });

        setLoading(false);
    }

    return (
        <>
            {
                isLoading ? <div className={className ? "d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4 position-relative mx-0" : ""}><ItemLoading/></div>
                : (
                    (nft && Object.keys(nft).length > 0) ?
                        <div className={className ? "d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4 position-relative mx-0" : ""}>
                            <div className={`nft__item my-0 pb-4 justify-content-between h-100 ${className}`}>
                                {
                                    nft?.action == "auction" &&
                                    <div className="de_countdown">
                                        <Clock deadline={new Date(nft.deadline).toLocaleDateString()} />
                                    </div>
                                }
                                <div className="nft__item_wrap w-100 ratio-1-1 flex-column position-relative">
                                    
                                    <Art
                                        tokenID={nft.tokenID}
                                        image={nft.image}
                                        asset={nft.asset}
                                        redirect={() => navigate(`/item-detail/${nft.tokenID}`)}
                                        type={nft.type}
                                    />

                                    {
                                        isNFTOwner && 
                                        <span>
                                            <small data-tip data-for={`owner-${nft.tokenID}`} className="owner-check"><i className="fal fa-badge-check"/></small>
                                            <ReactTooltip id={`owner-${nft.tokenID}`} type='info' effect="solid">
                                                <span>Your NFT</span>
                                            </ReactTooltip>
                                        </span>
                                    }
                                    {
                                        isBidOwner && 
                                        <span>

                                            <a data-tip data-for={`bid-${nft.tokenID}`} className="bid-check"><i className="fal fa-clock"/></a>
                                            <ReactTooltip id={`bid-${nft.tokenID}`} type='info' effect="solid">
                                                <span>Pending Bid</span>
                                            </ReactTooltip>
                                        </span>
                                    }

                                    {
                                        nft.status == 'premium' && 
                                        <span>

                                            <a data-tip data-for={`premium-${nft.tokenID}`} className="premium-nft"><i className="fal fa-sparkles"/></a>
                                            <ReactTooltip id={`premium-${nft.tokenID}`} type='info' effect="solid">
                                                <span>Premium NFT</span>
                                            </ReactTooltip>
                                        </span>
                                    }
                                </div>
                                <div className="nft__item_info mb-0">
                                    <span>
                                        <h4 onClick={() => navigate(`/item-detail/${nft.tokenID}`)}>{nft.nftName}</h4>
                                    </span>
                                    <div className="nft__item_price">
                                        { nftPrice ? <>{web3.utils.fromWei(nftPrice, 'ether')}<span>{ nft.action == 'list' ? "BNB" : "WBNB" }</span></> : ""}
                                    </div>
                                    <div className="trade-btn-group mt-2">
                                        { (!isNFTOwner && nft.action) && (
                                            nft.action == 'list'
                                                ? <span className="btn-main w-100" onClick={buyNow} >Buy Now</span>
                                                : (
                                                    !isBidOwner ? <span className="btn-main w-100" onClick={openModal}>Place Bid</span>
                                                    : <span className="btn-main w-100" onClick={withdrawBid}>Withdraw Bid</span>
                                                )
                                            )
                                        }
                                    </div>
                                </div>
                                {
                                    isTrading && 
                                    <div className="trade-loader">
                                        <div className="nb-spinner"></div>
                                    </div>
                                }
                            </div>

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
                        </div> : ""
                )
            }
        </>
    )
}