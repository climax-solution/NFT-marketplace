import React, { useEffect, useState, lazy, Suspense } from "react";
import Slider from "react-slick";
import { createGlobalStyle } from "styled-components";
import getWeb3 from "../../utils/getWeb3";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import { NotificationManager } from "react-notifications";


import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import MusicArt from "./Asset/music";
import VideoArt from "./Asset/video";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from "react-router-dom";

const PremiumNFTLoading = lazy(() => import('./Loading/PremiumNFTLoading'));
const Empty = lazy(() => import("./Empty"));

const GlobalStyles = createGlobalStyle`
  .slick-track {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .text-grey {
    color: #a2a2a2;
  }
`;

export default function ({ status, update }) {

  const dispatch = useDispatch();
  const initialUser = useSelector(({ auth }) => auth.user);
  const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

  const [list, setList] = useState([]);
  const [web3, setWEB3] = useState([]);
  const [Marketplace, setMarketplace] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);

  const settings = {
    dots: false,
    speed: 500,
    initialSlide: 0,
    adaptiveHeight: 300,
    responsive: [
      {
        breakpoint: 1900,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
        }
      },
      {
        breakpoint: 1600,
        settings: {
          slidesToShow:  4,
          slidesToScroll: 1,
          infinite: true
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow:  3,
          slidesToScroll: 1,
          infinite: true
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow:  2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow:  1,
          slidesToScroll: 1,
          dots: true
        }
      }
    ]
  };

  useEffect(async () => {
    const { _web3, instanceMarketplace } = await getWeb3();
    console.log(_web3);
    setWEB3(_web3);
    setMarketplace(instanceMarketplace);
  },[])

  useEffect(async() => {
    if (Marketplace) await fetchNFT();
  },[initialUser, Marketplace])

  const buyNow = async(id) => {
  
    if (!wallet_info) {
      NotificationManager.warning("Please connect metamask");
      return;
    }

    try {
        dispatch(UPDATE_LOADING_PROCESS(true));
        let { marketData, auctionData } = await Marketplace.methods.getItemNFT(id).call();
        if (marketData.marketStatus && !auctionData.existance) {
            await Marketplace.methods.buyNFT(id).send({ from: initialUser?.walletAddress, value: marketData.price });

            const data = {
                tokenID: id,
                type: 0,
                price: marketData.price,
                walletAddress: initialUser?.walletAddress
            }

            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            });

            update(!status);
            NotificationManager.success("Buy success");
        }
    } catch(err) {
        console.log(err);
        NotificationManager.error("Buy failed");
    }
    dispatch(UPDATE_LOADING_PROCESS(false));
  }

  const fetchNFT = async() => {
    if (initialUser.walletAddress == undefined) return;
    setCarouselLoading(true);
    try {
      let list = await Marketplace.methods.getPremiumNFTList().call();
      list = list.filter(item => item.marketData.premiumStatus);
      list.sort((before, after) => before.marketData.price - after.marketData.price);
      if (list.length > 10) list = list.slice(0, 10);
      let mainList = [];
      for await (let item of list) {
        await axios.get(item.nftData.tokenURI).then(res => {
          const { data } = res;
          mainList.push({ ...item, ...data});
        })
      }
            
      setList(mainList);
    } catch(err) { }
    setCarouselLoading(false);
  }

  const failedLoadImage = (e) => {
    e.target.src="/img/empty.jfif";
  }

  return (
    <section className='container no-top no-bottom'>
      <div className='row'>
        <div className="spacer-double"></div>
        <div className='col-lg-12 mb-2'>
            <h2>Premium NFTs</h2>
        </div>
      </div> 
      <div className='nft'>
        <Suspense fallback={<div>Loading...</div>}>
          <GlobalStyles/>
          { carouselLoading && <PremiumNFTLoading/> }
          {
            !carouselLoading && (
              <Slider {...settings}>
                {
                  list.map((nft, index) => {
                    const { auctionData: auction, marketData: market } = nft;
                    const price = !auction.existance ? market.price : (auction.currentBidPrice ? auction.currentBidPrice : auction.minPrice);
                    return (
                      <div className='itm' key={index}>
                        <div className="d-item">
                            <div className="nft__item">
                                <div className="nft__item_wrap">
                                  {
                                      (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <a href={`/item-detail/${nft.nftData.tokenID}`}><img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview" alt=""/></a>
                                  }

                                  {
                                      (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.nftData.tokenID}`}/>
                                  }

                                  {
                                      (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                  }
                                </div>
                                <div className="nft__item_info mb-0">
                                    <span>
                                        <h4><Link to={`/item-detail/${nft.nftData.tokenID}`} className="text-decoration-none text-grey">{nft.nftName}</Link></h4>
                                    </span>
                                    <div className="nft__item_price">
                                        {web3.utils.fromWei(price)} BNB
                                    </div>
                                    <div className="nft__item_action">
                                      { (nft.nftData.owner).toLowerCase() != (initialUser.walletAddress).toLowerCase() && <span onClick={() => buyNow(nft.nftData.tokenID)}>Buy now</span>}
                                    </div>
                                </div> 
                            </div>
                        </div>
                      </div>
                    )
                  })
                }
              </Slider>
            )
          }
          { !list.length && !carouselLoading && <Empty/> }
          </Suspense>
      </div>
    </section>
  )
}