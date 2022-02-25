import React, { useState, useEffect } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { NotificationManager } from "react-notifications";
import { useDispatch, useSelector } from "react-redux";
import styled, { createGlobalStyle } from "styled-components";
import Swal from 'sweetalert2'
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import Empty from "./Empty";
import addresses from "../../config/address.json";
import Loading from "./Loading/Loading";
const { marketplace_addr } = addresses;

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const GlobalStyles = createGlobalStyle`
    .trade-btn-group {
        span {
            padding: 2px 10px;
        }
    }
`;
export default function NotSellingNFT(props) {

    const dispatch = useDispatch();
    const initUserData = useSelector((state) => state.auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [web3, setWeb3] = useState({});
    const [NFT, setNFT] = useState({});
    const [Marketplace, setMarketplace] = useState({});
    const [nfts, setNFTs] = useState([]);
    const [restList, setRestList] = useState([]);
    const [height, setHeight] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const onImgLoad = ({target:img}) => {
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

    const putOnSale = async (id) => {
        
        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        await Swal.fire({
            title: '<span style="font-size: 22px">PLEASE ENTER PRICE</span>',
            input: 'number',
            width: 350,
            inputAttributes: {
              autocapitalize: 'off',
            },
            inputValidator: (value) => {
              if (value < 0.1)  return "Price must be greater than 0.1.";
            },
            color: '#000',
            showCancelButton: true,
            confirmButtonText: 'OK',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
          }).then(async(result) => {
            if (result.isConfirmed) {
                dispatch(UPDATE_LOADING_PROCESS(true));
                try {
                    const nftPrice = web3.utils.toWei((result.value).toString(), 'ether');
                    await NFT.methods.approve(marketplace_addr, id).send({from : initUserData.walletAddress})
                    .on('receipt', async(rec) => {
                        await Marketplace.methods.openTradeToDirect(id).send({ from: initUserData.walletAddress, value: nftPrice / 40 });
                        NotificationManager.success("Success");
                        const data = {
                            tokenID: id,
                            type: 1,
                            price: nftPrice / 40,
                            walletAddress: initUserData.walletAddress
                        }
        
                        await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{
        
                        });
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    });
                  
                } catch(err) {
                    NotificationManager.error("Failed");
                    dispatch(UPDATE_LOADING_PROCESS(false));
                }
            }
        })
    }

    const putOnAuction = async (id) => {
        
        if (!wallet_info) {
            NotificationManager.warning("Please connect metamask");
            return;
        }

        await Swal.fire({
            title: '<span style="font-size: 22px">PLEASE ENTER AUCTION DETAILS  </span>',
            inputAttributes: {
              autocapitalize: 'off',
            },
            html:
                '<input type="number" id="auction-price" class="swal2-input" placeholder="Please input price.">' +
                '<input type="number" id="auction-period" class="swal2-input" placeholder="Please input period.">',
            focusConfirm: false,
            preConfirm: () => {
                if (document.getElementById('auction-price').value < 0.1) {
                    Swal.showValidationMessage('Auction price must be higher than 0.1 BNB');   
                }

                else if (!document.getElementById('auction-period').value || document.getElementById('auction-period').value > 7 ) {
                   Swal.showValidationMessage('Auction period must be 1 ~ 7days')   
                }
                
                else return [ document.getElementById('auction-price').value, document.getElementById('auction-period').value ]
            },
            color: '#000',
            showCancelButton: true,
            confirmButtonText: 'OK',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
          }).then(async(result) => {
            if (result.isConfirmed) {
                dispatch(UPDATE_LOADING_PROCESS(true));
                try {
                    const nftPrice = web3.utils.toWei(result.value[0], 'ether');
                    await NFT.methods.approve(marketplace_addr, id).send({from : initUserData.walletAddress})
                    .on('receipt', async(rec) => {
                        await Marketplace.methods.openTradeToAuction(id, nftPrice, Math.floor(result.value[1] * 24)).send({ from: initUserData.walletAddress, value: nftPrice / 40 });

                        const data = {
                            tokenID: id,
                            type: 5,
                            price: nftPrice / 40,
                            walletAddress: initUserData.walletAddress
                        }
                        NotificationManager.success("Success");
                        await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).catch(res => {});
                        dispatch(UPDATE_LOADING_PROCESS(false));
                    });
                  
                } catch(err) {
                    NotificationManager.error("Failed");
                    dispatch(UPDATE_LOADING_PROCESS(false));
                }
            }
        })
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
        <>
            <GlobalStyles/>
            <InfiniteScroll
                dataLength={nfts.length}
                next={fetchNFT}
                hasMore={restList.length ? true : false}
                loader={<Loading/>}
                className="row"
            >
                {nfts.map( (nft, index) => (
                    <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                        <div className="nft__item h-100 justify-content-between">
                            <div className="nft__item_wrap" style={{height: `${height}px`}}>
                            <Outer>
                                <span>
                                    <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                                </span>
                            </Outer>
                            </div>
                            <div className="nft__item_info">
                                <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                    <h4>{nft.nftName}</h4>
                                </span>
                                <div className="nft__item_price">
                                    {web3.utils.fromWei(nft.marketData.price, "ether")} BNB
                                </div>
                                <div className="pb-4 trade-btn-group mt-2">
                                    { !nft.marketData.marketStatus && <span className="btn-main w-100" onClick={() => putOnSale(nft.nftData.tokenID)}>Put on Sale</span> }
                                    {!nft.auctionData.existance && <span className="btn-main w-100 mt-2" onClick={() => putOnAuction(nft.nftData.tokenID)}>Put on Auction</span> }
                                </div>
                            </div> 
                        </div>
                    </div>  
                ))}
            </InfiniteScroll>

            {!nfts.length && <Empty/>}
            
        </>
    )
}