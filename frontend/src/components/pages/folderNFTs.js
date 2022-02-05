import axios from "axios";
import React, {  useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { createGlobalStyle } from 'styled-components';
import getWeb3 from "../../utils/getWeb3";
import Empty from "../components/Empty";
import Loading from "../components/Loading";
import NotificationManager from "react-notifications/lib/NotificationManager";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import ReactTooltip from "react-tooltip";

const GlobalStyles  = createGlobalStyle`
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
`;

const folderNFTs = (props) => {
    const dispatch = useDispatch();
    const initUserData = useSelector((state) => state.auth.user);
    const params = useParams();
    const [web3, setWeb3] = useState(null);
    const [NFT, setNFT] = useState(null);
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restGradList, setRestGradList] = useState([]);
    const [userData, setUserData] = useState({});
    const [folderName, setFolderName] = useState("Collection");
    const [height, setHeight] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(async() => {
        const { _web3, instanceNFT, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setNFT(instanceNFT);
        setMarketplace(instanceMarketplace);
    },[])

    useEffect(async() => {
        if (Marketplace) {
            await getInitNFTs();
        }
    },[Marketplace])

    useEffect(() => {
        setUserData(initUserData);
    },[initUserData])
    const getInitNFTs = async() => {
        const { id } = params;
        let gradList = await Marketplace.methods.getSubFolderItem(id).call();
        let oldList = gradList[0];
        let list = [...oldList];
        list.sort(function(a, b) {
            let premiumA = a.marketData.premiumStatus;
            let premiumB = b.marketData.premiumStatus;
            if (premiumA && !premiumB) return 1;
            else if (!premiumA && premiumB) return -1;
            else return 0;
        });
        setFolderName(gradList[1]);
        await getNFTs(list);
    }

    const getNFTs = async (list) => {
        let mainList = [];
        for await (let item of list) {
            try {
                const { data } = await axios.get(`${item.nftData.tokenURI}`);
                mainList.push({ ...item, ...data });
            } catch (err) { }
        }
        
        setNFTLists(mainList);
        setIsLoading(false);
    }

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }

    const faliedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    const buyNow = async(id) => {
        try {
            let { marketData, auctionData } = await Marketplace.methods.getItemNFT(id).call();
            if (marketData.marketStatus && !auctionData.existance) {
                await Marketplace.methods.buyNFT(id).send({ from: userData.walletAddress, value: marketData.price });
                NotificationManager.success("Buy success");
            }
        } catch(err) {
            console.log(err);
            NotificationManager.error("Buy failed");
        }
    }

    const placeBid = async(id) => {
        let {auctionData} = await Marketplace.methods.getItemNFT(id).call();
        let lastPrice = web3.utils.fromWei(auctionData.currentBidPrice, "ether");
        if (!Number(lastPrice)) lastPrice = web3.utils.fromWei(auctionData.minPrice, "ether");
        if (auctionData.existance) {
            dispatch(UPDATE_LOADING_PROCESS(false));
           try {
                await Swal.fire({
                    title: '<span style="font-size: 22px">PLEASE ENTER PRICE</span>',
                    input: 'number',
                    width: 350,
                    inputAttributes: {
                    autocapitalize: 'off',
                    },
                    inputValidator: (value) => {
                        if (value <= lastPrice) return `Price must be greater than ${lastPrice} BNB.`;
                    },
                    color: '#000',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    showLoaderOnConfirm: true,
                    allowOutsideClick: () => !Swal.isLoading()
                }).then(async(res) => {
                    if (res.isConfirmed) {
                        const accounts = await web3.eth.getAccounts();
                        if (!accounts.length) throw new Error();
                        await Marketplace.methods.placeBid(id).send({ from: accounts[0], value: web3.utils.toWei(res.value, "ether") });
                        NotificationManager.success("Success Bid");
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    }
                });
            } catch(err) {
                console.log(err);
                NotificationManager.error("Failed Bid");
                dispatch(UPDATE_LOADING_PROCESS(false));
           }
        }
    }

    console.log(nfts, isLoading, userData);

    return (
        <div>
            <GlobalStyles/>
            <section className='jumbotron breadcumb no-bg'>
                <div className='mainbreadcumb'>
                    <div className='container'>
                        <div className='row m-10-hor'>
                        <div className='col-12'>
                            <h1 className='text-center'>{folderName}</h1>
                        </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className='container'>
                {
                    isLoading && <Loading/>
                }

                {
                    !isLoading &&  (
                        <div className='row'>
                            {
                                nfts.map( (nft, index) => {
                                    const price = !nft.auctionData.existance ? nft.marketData.price : (Number(nft.auctionData.currentBidPrice) ? nft.auctionData.currentBidPrice : nft.auctionData.minPrice);
                                    const nftOwner =( (nft.nftData.owner).toLowerCase() == (initUserData.walletAddress).toLowerCase());
                                    const bidOwner = (nft.auctionData.currentBidOwner).toLowerCase() == (userData.walletAddress).toLowerCase();
                                    return (<div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                                        <div className="nft__item m-0 pb-4">
                                            <div className="nft__item_wrap" style={{ height: height+'px'}}>
                                                <a href={`/item-detail/${nft.nftData.tokenID}`} className="position-relative">
                                                    <img onLoad={onImgLoad} src={nft.image} onError={faliedLoadImage} className="lazy nft__item_preview" alt=""/>
                                                    {
                                                        nftOwner && 
                                                        <>
                                                            
                                                            <a data-tip data-for={`owner-${index}`} className="owner-check"><i className="fal fa-badge-check"/></a>
                                                            <ReactTooltip id={`owner-${index}`} type='info' effect="solid">
                                                                <span>Your NFT</span>
                                                            </ReactTooltip>
                                                        </>
                                                    }
                                                    {
                                                        bidOwner && 
                                                        <>
                                                            
                                                            <a data-tip data-for={`bid-${index}`} className="bid-check"><i className="fal fa-clock"/></a>
                                                            <ReactTooltip id={`bid-${index}`} type='info' effect="solid">
                                                                <span>Pending Bid</span>
                                                            </ReactTooltip>
                                                        </>
                                                    }
                                                </a>
                                            </div>
                                            <div className="nft__item_info mb-0">
                                                <span>
                                                    <h4>{nft.nftName}</h4>
                                                </span>
                                                <div className="nft__item_price">
                                                    {web3.utils.fromWei(price, 'ether')}<span>BNB</span>
                                                </div>
                                                <div className="pb-4 trade-btn-group">
                                                    { !nftOwner && nft.marketData.marketStatus && (
                                                        !nft.auctionData.existance
                                                            ? <span className="btn-main w-100" onClick={() => buyNow(nft.nftData.tokenID)} >Buy Now</span>
                                                            : (
                                                                !bidOwner ? <span className="btn-main w-100" onClick={() => placeBid(nft.nftData.tokenID)}>Place Bid</span> : ""
                                                            )
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>)
                                })
                            }
                            {
                                !nfts.length && <Empty/>
                            }
                        </div>
                    )
                }
            </section>
        </div>

    );
}

export default folderNFTs;