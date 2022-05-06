import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import getWeb3 from "../../../../utils/getWeb3";
import { warning_toastify} from "../../../../utils/notify";

import Art from "../../Asset/art";
import ItemLoading from "../../Loading/ItemLoading";
import AuctionSellModal from "../../Modal/AuctionSellModal";
import DirectSellModal from "../../Modal/DirectSellModal";

export default function NotSaleNFT({ data, NFT, Marketplace, remove }) {

    const navigate = useNavigate();
    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    
    const [web3, setWeb3] = useState(null);
    const [nft, setNFT] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [auctionVisible, setAuctionVisible] = useState(false);
    const [directVisible, setDirectVisible] = useState(false);
    const [activeID, setActiveID] = useState(-1);

    useEffect(async() => {
        if (data) {
            const { _web3 } = await getWeb3();
            setWeb3(_web3);
            let _nft = {};
            let saleData = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID: data.tokenID}).then(res => {
                return res.data;
            }).catch(err => {
                return {
                    nft: {}, childList: []
                }
            });
            if (!saleData.nft.metadata) {
                await axios.get(data.tokenURI).then(async(res) => {
                    if (typeof (res.data) === 'object') _nft = { ...data, ...res.data };
                }).catch(err => {
    
                });
            }
            
            else {
                try {
                    const _meta = JSON.parse(saleData.nft.metadata);
                    _nft = { ...data, ..._meta };
                } catch(err) {
    
                }
            }
            setNFT(_nft);
            setLoading(false);
        }
    },[data])

    const listOnSale = (id) => {
        if (!initialUser.walletAddress)
        if (!wallet_info) {
            warning_toastify('Please connect metamask');
            return;
        }

        setActiveID(id);
        setDirectVisible(true);
    }

    const listOnAuction = (id) => {
        if (!wallet_info) {
            warning_toastify('Please connect metamask');
            return;
        }

        setActiveID(id);
        setAuctionVisible(true);
    }

    return (
        <>
            {
                isLoading ? <div className="d-item col-lg-3 col-md-6 col-sm-6 mt-2 col-xs-12"><ItemLoading/></div>
                : (
                    !Object.keys(nft).length ? ""
                    : (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 mt-2 col-xs-12">
                            <div className="nft__item h-100 justify-content-between">
                                <div className="nft__item_wrap w-100 ratio-1-1">
                                    <Art
                                        tokenID={nft.tokenID}
                                        image={nft.image}
                                        asset={nft.asset}
                                        redirect={() => navigate(`/item-detail/${nft.tokenID}`)}
                                        type={nft.type}
                                    />
                                </div>
                                <div className="nft__item_info">
                                    <span>
                                        <h4 onClick={() => !isLoading ? navigate(`/item-detail/${nft.tokenID}`) : null }>{ nft.nftName }</h4>
                                    </span>
                                    {/* <div className="nft__item_price">{ web3.utils.fromWei(nft.marketData.price, "ether")} BNB </div> */}
                                    <div className="pb-4 trade-btn-group mt-2">
                                        <span className="btn-main w-100" onClick={() => listOnSale(nft.tokenID)}>List</span>
                                        <span className="btn-main w-100 mt-2" onClick={() => listOnAuction(nft.tokenID)}>List on auction</span>
                                    </div>
                                </div> 
                            </div>
                            {
                                auctionVisible && <AuctionSellModal
                                    visible={auctionVisible}
                                    close={
                                        (status = false) => {
                                            if (status) remove();
                                            setAuctionVisible(false)
                                        }
                                    }
                                    Marketplace={Marketplace}
                                    NFT={NFT}
                                    web3={web3}
                                    tokenID={activeID}
                                />
                            }
                            {
                                directVisible && <DirectSellModal
                                    visible={directVisible}
                                    close={
                                        (status = false) => {
                                            if (status) remove();
                                            setDirectVisible(false)
                                        }
                                    }
                                    Marketplace={Marketplace}
                                    NFT={NFT}
                                    web3={web3}
                                    tokenID={activeID}
                                />
                            }
                        </div>
                    )
                )
            }
        </>
    )
}