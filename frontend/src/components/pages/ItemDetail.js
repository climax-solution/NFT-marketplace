import React, { useEffect, useState, lazy } from "react";
import { createGlobalStyle } from 'styled-components';
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import axios from "axios";
import Modal from 'react-awesome-modal';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

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

    .btn-apply {
        background: #3fb737;
    }

    .btn-apply:hover {
        box-shadow: 2px 2px 20px 0px #3fb737;
    }
    .groups {
        display: grid;
        grid-template-columns: auto auto;
        column-gap: 15px;
    }
`;

const NFTItem = () => {

    const params = useParams();

    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const initialUser = useSelector((state) => state.auth.user);

    const [nft, setNFTData] = useState();
    const [web3, setWeb3] = useState();
    const [Marketplace, setMarketplace] = useState();
    const [loading, setLoading] = useState(true);
    const [isTrading, setTrading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [bidPrice, setBidPrice] = useState('');
    const [updated, setUpdate] = useState(true);

    const [price, setPrice] = useState();
    const [isNFTOwner, setNFTOwner] = useState(false);
    const [isBidOwner, setBidOwner] = useState(false);
    const [claimable, setClaimable] = useState(false);

    useEffect(async() => {
        if (!updated) return;
        const { _web3, instanceMarketplace, instanceNFT } = await getWeb3();
        setWeb3(_web3);
        setMarketplace(instanceMarketplace);
        try {
            const { id } = params;
            const item = await instanceNFT.methods.getItemNFT(id).call();
            const saleData = await axios.post('http://localhost:7060/sale/get-nft-item', { tokenID: id}).then(res => {
                return res.data;
            }).catch(err => {
                return {}
            });
            
            await axios.get(item.tokenURI).then(async(res) => {
                const { data } = res;
                setNFTData({ ...item, ...data, ...saleData.nft });
                const _price = saleData?.nft?.price ? saleData.nft.price : null;
                const nftOwner =( (item.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase());
                const bidOwner = saleData?.childList ? (childList[(initialUser.walletAddress).toLowerCase()] ? true : false) : false;
                const _claimable = saleData.nft.deadline ? Date.parse(new Date(saleData.nft.deadline * 1000)) - Date.parse(new Date()) : 0;
                
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
        setUpdate(false);
        setLoading(false);
    },[updated, ])

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
            setLoading(true);
            const { nft: _nft } = await axios.post('http://localhost:7060/sale/get-nft-item', { tokenID: nft.tokenID }).then(res => {
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
        setLoading(false);
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
            setLoading(true);
            const price = web3.utils.toWei(bidPrice.toString(), "ether");
            setTrading(true);
            setVisible(false);
            setBidPrice('');
            
            const nonce = await Marketplace.methods.nonces(initialUser.walletAddress).call();
            const result = await sign(nonce, activeID, initialUser.walletAddress, price, false);
  
            const offer = {
                tokenID: nft.tokenID,
                price,
                walletAddress: initialUser.walletAddress,
                signature: result
            };

            await axios.post('http://localhost:7060/sale/create-new-offer', offer).then(res => {
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
            // await refresh();
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
        setLoading(false);
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
            setLoading(true);
            const withdraw = {
                walletAddress: initialUser.walletAddress,
                tokenID: nft.tokenID
              };
      
            await axios.post('http://localhost:7060/sale/cancel-offer', withdraw).then(res => {
                
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
            // await refresh();
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
        setLoading(false);
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

    const _closeModal = () => {
        setBidPrice('');
        setVisible(false);
    }

    return (
        <div>
            <>
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

                                <div className="col-md-6 col-sm-12 text-center d-md-block d-flex justify-content-center align-items-center flex-column">
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="img-fluid img-rounded mb-sm-30" alt=""/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={``}/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                    }

                                    { !isNFTOwner && (
                                        nft.action && (
                                            nft.action == 'list'
                                                ? <span className="btn-main py-3 mx-auto w-100 mt-3 mw-500px" onClick={buyNow} >Buy Now</span>
                                                : (
                                                    !isBidOwner ? <span className="btn-main mx-auto py-3 w-50 mt-2" onClick={openModal}>Place Bid</span> : (
                                                        claimable <= 0 && <span className="btn-main mx-auto py-3 w-50 mt-2" onClick={withdrawBid}>Withdraw Bid</span>
                                                    )
                                                )
                                            )
                                        )
                                    }
                                </div>
                                <div className="col-md-6 col-sm-12">
                                    <div className="item_info">
                                        {
                                            nft.action == "auction" && (
                                                <>
                                                    Auctions ends in 
                                                    <div className="de_countdown">
                                                        <Clock deadline={nft.auctionData.endAuction * 1000} />
                                                    </div>
                                                </>
                                            )
                                        }
                                        <h2>{nft.nftName}</h2>
                                        <h5>TOKEN ID : {nft.tokenID} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { price ?`PRICE : ${web3.utils.fromWei(price.toString(), "ether")} BNB` : ""}</h5>
                                        <div className="item_info_counts">
                                            <div className="item_info_type"><i className="fa fa-image"></i>{nft.category}</div>
                                            {
                                                nft.status == 'premium' && (
                                                    <div className="item_info_type"><i className="fa fa-sparkles"></i>Premium NFT</div>
                                                )
                                            }
                                        </div>
                                        <p>{nft.nftDesc}</p>

                                        <div className="spacer-40"></div>
                                        <Attr data={nft.attributes}/>
                                    </div>
                                </div>

                                </div>
                                <Modal
                                    visible={visible}
                                    width="300"
                                    height="200"
                                    effect="fadeInUp"
                                    onClickAway={null}
                                >
                                    {
                                        isTrading ?
                                        <div className='d-flex w-100 h-100 justify-content-center align-items-center'>
                                            <div className='reverse-spinner'></div>
                                        </div>
                                        : <div className='p-5'>
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
                                                        className='btn-main btn-apply w-100'
                                                        onClick={placeBid}
                                                    >Place</button>
                                                    <button
                                                        className='btn-main w-100'
                                                        onClick={_closeModal}
                                                    >Cancel</button>
                                                </div>
                                            </div>
                                    }
                                </Modal>
                            </section>
                        : !Object.keys(nft).length && <Empty/>
                    )
                }
                <Footer />
            </>
        </div>
    );
}
export default NFTItem;