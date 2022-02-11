import React, { useState, useEffect } from "react";
import { NotificationManager } from "react-notifications";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import Empty from "./Empty";
import Loading from "./Loading/Loading";
import axios from "axios";

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
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [web3, setWeb3] = useState({});
    const [Marketplace, setMarketplace] = useState({});
    const [NFT, setNFT] = useState({});
    const [nfts, setNFTs] = useState([]);
    const [restList, setRestList] = useState([]);
    const [height, setHeight] = useState(0);
    const [loaded, setLoaded] = useState(false);

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
            setNFT(_insNFT);
            setRestList(data);
            setMarketplace(_insMarketplace);
            setLoaded(true);
        }
    },[props])
  
    useEffect(async() => {
        if (loaded) {
            await fetchNFT();
        }
    },[loaded])

    const putDownSale = async (id) => {

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const buyAmount = nft.marketData.price;
            await Marketplace.methods.closeTradeToDirect(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 });

            const data = {
                tokenID: id,
                type: 2,
                price: buyAmount / 40,
                walletAddress: initialUser.walletAddress
            }
            NotificationManager.success("Success");
            await axios.post('http://localhost:7060/activity/create-log', data).then(res =>{

            });
        } catch(err) {
            console.log(id, "==>" ,err);
            NotificationManager.error("Failed");
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
        props.updateStatus(!props.status);
    }

    const putDownAuction = async (id) => {

        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const nft = await Marketplace.methods.getItemNFT(id).call();
            if (!web3.utils.toBN(nft.auctionData.currentBidOwner).isZero()) {
                NotificationManager.warning("There is existing bid");
                dispatch(UPDATE_LOADING_PROCESS(false));
                return;
            }
            const buyAmount = nft.marketData.price;
            await Marketplace.methods.closeTradeToAuction(id).send({ from: initialUser.walletAddress, value: buyAmount / 40 });
            const data = {
                tokenID: id,
                type: 6,
                price: buyAmount / 40,
                walletAddress: initialUser.walletAddress
            }
            await NotificationManager.success("Success");
            await axios.post('http://localhost:7060/activity/create-log', data).then(res =>{

            });
        } catch(err) {
            console.log(id, "==>" ,err);
            NotificationManager.error("Failed");
        }
        await dispatch(UPDATE_LOADING_PROCESS(false));
        await props.updateStatus(!props.status);
    }
  
    const updatePremiumNFT = async (id, status) => {
        
        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        dispatch(UPDATE_LOADING_PROCESS(true));
        try {
            const owner = await NFT.methods.ownerOf(id).call();
            if (owner.toLowerCase() != (initialUser.walletAddress).toLowerCase() && initialUser.walletAddress) throw "Not owner";
            const nft = await Marketplace.methods.getItemNFT(id).call();
            const tax = nft.marketData.price;
            await Marketplace.methods.updatePremiumStatus(id, status).send({ from: initialUser.walletAddress, value: tax / 20});

            const data = {
                tokenID: id,
                type: status ? 3 : 4,
                price: tax / 20,
                walletAddress: initialUser.walletAddress
            }
            NotificationManager.success("Success");
            await axios.post('http://localhost:7060/activity/create-log', data).then(res =>{

            });
            // await this.getAllPhotos();
        } catch(err) {
            console.log(err);
            if (typeof err == "string") NotificationManager.error(err);
            else NotificationManager.error("Failed");
        }
        dispatch(UPDATE_LOADING_PROCESS(false));
        props.updateStatus(!props.status);
    }

    const fetchNFT = async() => {
        if (!restList.length) return;
        let tmpList = restList;
        if (tmpList.length > 8) {
          tmpList = tmpList.slice(0, 8);
          setRestList(restList.slice(8, restList.length));
        }
        else setRestList([]);
        let mainList = [];
        for await (let item of tmpList) {
          await axios.get(item.nftData.tokenURI).then(res => {
            mainList.push({...item, ...res.data});
          })
        }
    
        setNFTs([...nfts, ...mainList]);
    }

    return (
        <div className='row'>
            <GlobalStyles/>
            <InfiniteScroll
                dataLength={nfts.length}
                next={fetchNFT}
                hasMore={restList.length ? true : false}
                loader={<Loading/>}
                className="row"
            >
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
                                <div className="pb-4 trade-btn-group mt-2">
                                    { nft.marketData.marketStatus && (
                                        !nft.auctionData.existance ?
                                            <span className="btn-main w-100" onClick={async() => await putDownSale(nft.nftData.tokenID)}>Put down sale</span>
                                            :<span className="btn-main w-100" onClick={() => putDownAuction(nft.nftData.tokenID)}>Put down auction</span>
                                        )
                                    }
                                    { !nft.auctionData.existance && (!nft.marketData.premiumStatus ? <span className="btn-main mt-2 w-100" onClick={async() => await updatePremiumNFT(nft.nftData.tokenID, true)}>To Preimum</span> : <span className="btn-main mt-2 w-100"  onClick={() => updatePremiumNFT(nft.nftData.tokenID, false)}>To Normal</span>) }
                                </div>
                            </div> 
                        </div>
                    </div>  
                ))}
            </InfiniteScroll>
            {!nfts.length && <Empty/>}
            
        </div>
    )
}