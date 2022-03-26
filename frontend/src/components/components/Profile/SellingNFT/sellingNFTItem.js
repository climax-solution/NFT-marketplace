import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import getWeb3 from "../../../../utils/getWeb3";
import { warning_toastify, success_toastify, error_toastify } from "../../../../utils/notify";
import { auctionSign, deListSign, listSign } from "../../../../utils/sign";

const MusicArt = lazy(() => import("../../Asset/music"));
const VideoArt = lazy(() => import("../../Asset/video"));
const ItemLoading = lazy(() => import("../../Loading/ItemLoading"));

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
            warning_toastify(message);
            return;
        }

        setTrading(true);
        try {
            const signature = await deListSign(nft.action, id, initialUser.walletAddress, nft.price, nft.status == "premium" ? true : false);

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/delist`, { tokenID: id, walletAddress: initialUser.walletAddress, signature}).then(res => {

            }).catch(err => {

            })

            success_toastify('Success');
            
            await remove();
        } catch(err) {
            let message = "";
            if (err?.code == 4001) message = "Cancelled";
            else message = "Failed";

            error_toastify(message);

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
            warning_toastify(message);
            return;
        }

        setTrading(true);
        try {
            const nonce = await Marketplace.methods.nonces(id).call();
            let signature  = "";
            if (nft.action == 'list') {
                signature = await listSign(nonce, id, initialUser.walletAddress, nft.price, status);
            } else {
                const deadline = Math.floor((Date.parse(new Date(nft.deadline)) - Date.parse(new Date(nft.created_at))) / (60 * 60 * 1000));
                signature = await auctionSign(nonce, id, initialUser.walletAddress, nft.price, deadline, status);
            }

            const data = {
                nonce,
                tokenID: id,
                action: nft.action,
                status: status ? "premium" : "normal",
                signature
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/update-premium`, data).then(res => {
                success_toastify('Success');
            }).catch(err => {

            })
        } catch(err) {
            let message = "";
            if (err?.code == 4001) message = "Cancelled";
            else message = "Failed";

            error_toastify(message);
        }
        await refresh(id);
        setTrading(false);
    }

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            let _nft = {};
            await axios.get(data.tokenURI).then(async(res) => {
                if (typeof (res.data) === 'object') _nft = { ...data, ...res.data };
            }).catch(err => {

            });
            setNFT(_nft);
            setLoading(false);
        }
    },[data])

    const refresh = async(tokenID) => {
        await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID, walletAddress: initialUser.walletAddress }).then(res => {
            setNFT({ ...nft, ...res.data.nft });
        }).catch(err => {
            // remove();
        });
        
    }

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mt-3">
            {
                isLoading ? <ItemLoading/>
                : (
                    !Object.keys(nft).length ? ""
                    : (
                        <>
                            <div className="nft__item position-relative my-0 h-100 justify-content-between">
                                {
                                    isTrading && 
                                    <div className="trade-loader start-0 w-100">
                                        <div className="nb-spinner"></div>
                                    </div>
                                }
                                <div className="nft__item_wrap w-100 ratio-1-1 flex-column position-relative">
                                    {
                                        (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview ratio-1-1" onClick={() => navigate(`/item-detail/${nft.tokenID}`) } role="button" alt=""/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.tokenID}`}/>
                                    }

                                    {
                                        (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
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
                                <div className="nft__item_info">
                                    <span>
                                        <h4 onClick={() => !isLoading ? navigate(`/item-detail/${nft.tokenID}`) : null }>{ nft.nftName }</h4>
                                    </span>
                                    <div className="nft__item_price">
                                        {web3.utils.fromWei(nft.price, "ether")} { nft.action == 'list' ? "BNB" : "WBNB"}
                                    </div>
                                    <div className="pb-4 trade-btn-group mt-2">
                                        {
                                            nft.action !== 'offer' &&
                                                <span className="btn-main w-100" onClick={() => putDownSale(nft.tokenID)}>{ nft.action == 'list' ? "Delist" : "Delist auction"}</span>
                                        }
                                        { nft.status === 'normal' ? <span className="btn-main mt-2 w-100" onClick={async() => await updatePremiumNFT(nft.tokenID, true)}>Promote to preimum</span> : <span className="btn-main mt-2 w-100"  onClick={() => updatePremiumNFT(nft.tokenID, false)}>Reset to normal</span> }
                                    </div>
                                </div> 
                            </div>
                        </>
                    )
                )
            }
        </div>
    )
}