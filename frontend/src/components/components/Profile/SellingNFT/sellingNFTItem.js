import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactTooltip from "react-tooltip";
import getWeb3 from "../../../../utils/getWeb3";
import { deListSign, listSign } from "../../../../utils/sign";

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
            const signature = await deListSign(nft.action, id, initialUser.walletAddress, nft.price, nft.status);

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/delist`, { tokenID: id, walletAddress: initialUser.walletAddress, signature}).then(res => {

            }).catch(err => {

            })

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
            // await axios.post(`${process.env.REACT_APP_BACKEND}activity/create-log`, data).then(res =>{

            // }).catch(err => { });
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
            const nonce = await Marketplace.methods.nonces(initialUser.walletAddress).call();
            const signature  = await listSign(nonce, id, initialUser.walletAddress, nft.price, status);

            const data = {
                nonce,
                tokenID: id,
                action: nft.action,
                status: status ? "premium" : "normal",
                signature
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/update-premium`, data).then(res => {
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
            }).catch(err => {

            })
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
                                <div className="nft__item_wrap flex-column position-relative wap-height">
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
                                        {web3.utils.fromWei(nft.price, "ether")} BNB
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