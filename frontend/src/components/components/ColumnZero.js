import React, { useState, useEffect } from "react";
import { NotificationManager } from "react-notifications";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import Empty from "./Empty";

const GlobalStyles = createGlobalStyle`
    .trade-btn-group {
        span {
            padding: 2px 10px;
        }
    }
`;
export default function SellingNFT(props) {

    const dispatch = useDispatch();
    const initialUser = useSelector(({ auth }) => auth.user);

    const [web3, setWeb3] = useState({});
    const [Marketplace, setMarketplace] = useState({});
    const [NFT, setNFT] = useState({});
    const [nfts, setNFTs] = useState([]);
    const [height, setHeight] = useState(0);

    const onImgLoad = ({target: img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(() => {
        const { _web3, data, _insNFT, _insMarketplace} = props;
        if (_insMarketplace) {
            setWeb3(_web3);
            setNFTs(data);
            setNFT(_insNFT);
            setMarketplace(_insMarketplace);
        }
    },[props])
  
    const putDownSale = async (id) => {
        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const buyAmount = nft.marketData.price;
            await Marketplace.methods.closeTradeToDirect(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 }).
            then(async(result) => {
                NotificationManager.success("Success");
            });
        } catch(err) {
            console.log(id, "==>" ,err);
            NotificationManager.error("Failed");
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
    }
  
    const updatePremiumNFT = async (id, status) => {
        try {
            const owner = await NFT.methods.ownerOf(id).call();
            if (owner.toLowerCase() != (initialUser.walletAddress).toLowerCase() && initialUser.walletAddress) throw "Not owner";
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const tax = nft.marketData.price;
            await Marketplace.methods.updatePremiumStatus(id, status).send({ from: initialUser.walletAddress, value: tax / 20});
            NotificationManager.success("Success");
            // await this.getAllPhotos();
        } catch(err) {
            console.log(err);
            if (typeof err == "string") NotificationManager.error(err);
            else NotificationManager.error("Failed");
        }
    }

    return (
        <div className='row'>
            <GlobalStyles/>
            { nfts.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                    <div className="nft__item">
                        <div className="nft__item_wrap">
                            <a>
                                <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                            </a>
                        </div>
                        <div className="nft__item_info">
                            <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                <h4>{nft.nftName}</h4>
                            </span>
                            <div className="nft__item_price">
                                {web3.utils.fromWei(nft.marketData.price, "ether")} BNB
                            </div>
                            <div className="pb-4 trade-btn-group">
                                { nft.marketData.marketStatus && (
                                    !nft.auctionData.existance ?
                                        <span className="btn-main w-100" onClick={() => putDownSale(nft.nftData.tokenID)}>Put down sale</span>
                                        :<span className="btn-main w-100">Put down auction</span>
                                    )
                                }
                                { !nft.auctionData.existance && (!nft.marketData.premiumStatus ? <span className="btn-main mt-2 w-100" onClick={() => updatePremiumNFT(nft.nftData.tokenID, true)}>To Preimum</span> : <span className="btn-main mt-2 w-100"  onClick={() => updatePremiumNFT(nft.nftData.tokenID, false)}>To Normal</span>) }
                            </div>
                        </div> 
                    </div>
                </div>  
            ))}

            {!nfts.length && <Empty/>}
            
        </div>
    )
}