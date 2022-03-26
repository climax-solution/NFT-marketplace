import React, { useEffect, useState, lazy } from "react";
import { createGlobalStyle } from 'styled-components';
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import { warning_toastify, success_toastify, error_toastify, info_toastify } from "../../utils/notify";
import axios from "axios";
import Modal from 'react-awesome-modal';
import { useSelector } from "react-redux";
import { marketplace_addr } from "../../config/address.json";

const Clock = lazy(() => import("../components/Clock"));
const Footer = lazy(() => import('../components/footer'));
const Empty = lazy(() => import("../components/Empty"));
const Attr = lazy(() => import("../components/ItemDetails/attributes"));
const ItemDetailsLoading = lazy(() => import("../components/Loading/ItemDetailsLoading"));
const Art = lazy(() => import("../components/Asset/art"));

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
    const [WBNB, setWBNB] = useState();

    const [loading, setLoading] = useState(true);
    const [isTrading, setTrading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [bidPrice, setBidPrice] = useState('');
    const [updated, setUpdate] = useState(true);

    const [price, setNFTPrice] = useState();
    const [isNFTOwner, setNFTOwner] = useState(false);
    const [isBidOwner, setBidOwner] = useState(false);

    useEffect(async() => {
        if (!updated) return;
        const { _web3, instanceMarketplace, instanceNFT, instanceWBNB } = await getWeb3();
        setWeb3(_web3);
        setWBNB(instanceWBNB);
        setMarketplace(instanceMarketplace);
        
        try {
            const { id } = params;
            const _orgNFT = await instanceNFT.methods.getItemNFT(id).call();
            const saleData = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID: id}).then(res => {
                return res.data;
            }).catch(err => {
                return {
                    nft: {}, childList: []
                }
            });
            
            if (saleData.nft?.walletAddress) {
                if ((_orgNFT.owner).toLowerCase() != (saleData.nft.walletAddress).toLowerCase()) {
                    await axios.post(`${process.env.REACT_APP_BACKEND}sale/delist`, {
                        tokenID: saleData.nft.tokenID,
                        walletAddress: saleData.nft.walletAddress
                    });
                }
            }

            await axios.get(`${_orgNFT.tokenURI}`).then(res => {
                const { data: metadata } = res;
                const nftOwner = ( (_orgNFT.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase());
                setNFTOwner(nftOwner);
    
                if ((_orgNFT.owner).toLowerCase() == (saleData.nft.walletAddress)?.toLowerCase()) {
                    const _price = saleData.nft.price;
                    const existedBid = saleData.nft.action == 'auction' ? saleData.childList.filter(item => (item.walletAddress).toLowerCase() == (initialUser.walletAddress).toLowerCase()) : [];
                    const bidOwner = existedBid.length ? true : false;
                    
                    setNFTData({ ..._orgNFT, ...metadata, ...saleData.nft });
                    setNFTPrice(_price);
                    setBidOwner(bidOwner);
                }
                else setNFTData({ ..._orgNFT, ...metadata });
            });
        } catch(err) {
            console.log(err);
            setNFTData({});
        }
        setUpdate(false);
        setLoading(false);
    },[updated, ])

    const buyNow = async() => {

        let message = "";
        if (!initialUser.walletAddress) message = "Please log in";
        else if (!wallet_info) message = 'Please connect metamask';

        if (message) {
            warning_toastify(message);
            return;
        }

        try {
            setLoading(true);
            const { nft: _nft } = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID: nft.tokenID }).then(res => {
                return res.data;
            });

            if (_nft.action != 'list') throw Error();

            await Marketplace.methods.buy(_nft.tokenID, _nft.walletAddress, _nft.price, _nft.status == "premium" ? true : false, nft.signature).send({ from: initialUser.walletAddress, value: nft.price });
            success_toastify("Buy success");
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

            error_toastify(message);
        }
        setUpdate(true);
        setLoading(false);
    }

    const placeBid = async() => {

        let message = "";
        let minPrice = web3.utils.fromWei(nftPrice, "ether");
        if (!initialUser.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        else if (bidPrice < minPrice) message = 'Minimum price is ' + minPrice + 'BNB';

        if (message) {
            error_toastify(message);
            return;
        }

        try {
            setLoading(true);
            const price = web3.utils.toWei(bidPrice.toString(), "ether");
            setTrading(true);
            setVisible(false);
            setBidPrice('');
            
            await WBNB.methods.approve(marketplace_addr, price).send({ from: initialUser.walletAddress });
            const nonce = await Marketplace.methods.nonces(nft.tokenID).call();
            const result = await sign(nonce, nft.tokenID, initialUser.walletAddress, price, false);
  
            const offer = {
                tokenID: nft.tokenID,
                price,
                walletAddress: initialUser.walletAddress,
                signature: result
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/create-new-offer`, offer).then(res => {
                const { message } = res.data;
                success_toastify(message);
              }).catch(err => {
                const { error } = err.response.data;
                success_toastify(error);
            })
            // await refresh();
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

            error_toastify(message);
        }
        setUpdate(true);
        setLoading(false);
    }

    const withdrawBid = async() => {
        let message = "";
        if (!initialUser.walletAddress) message = 'Please log in';

        if (!wallet_info) message = 'Please connect metamask';
        if (message) {
            warning_toastify(message);
            return;
        }

        try {
            setLoading(true);
            const signature = await processOfferSign(nft,tokenID, initialUser.walletAddress, nft.price);
            const withdraw = {
                walletAddress: initialUser.walletAddress,
                tokenID: nft.tokenID,
                signature
            };
      
            await axios.post(`${process.env.REACT_APP_BACKEND}sale/cancel-offer`, withdraw).then(res => {
                
                const { message } = res.data;
                info_toastify(message);
            });
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";
            error_toastify(message);
        }
        setUpdate(true);
        setLoading(false);
    }

    const openModal = () => {
        let message = '';
        if (!initialUser.walletAddress) message = 'Please log in';
        else if (!wallet_info) message = 'Please connect metamask';
        if (message) {
          warning_toastify(message);
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
                    loading ? <ItemDetailsLoading/>
                    : (
                        Object.keys(nft).length ?
                            <section className='container'>
                                <div className='row mt-md-5 pt-md-4'>

                                    <div className="col-md-6 col-sm-12 text-center d-md-block d-flex justify-content-center align-items-center flex-column">
                                        <Art
                                            tokenID={nft.tokenID}
                                            image={nft.image}
                                            asset={nft.asset}
                                            redirect={() => null}
                                            type={nft.type}
                                        />

                                        { !isNFTOwner && (
                                            nft.action && (
                                                nft.action == 'list'
                                                    ? <span className="btn-main py-3 mx-auto w-100 mt-3 mw-500px" onClick={buyNow} >Buy Now</span>
                                                    : (
                                                        !isBidOwner 
                                                        ? <span className="btn-main mx-auto py-3 w-50 mt-2" onClick={openModal}>Place Bid</span>
                                                        : <span className="btn-main mx-auto py-3 w-50 mt-2" onClick={withdrawBid}>Withdraw Bid</span>
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
                                                            <Clock deadline={new Date(nft.deadline).toLocaleDateString()} />
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