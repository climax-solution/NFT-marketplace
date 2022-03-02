import React, { useEffect, useState, lazy, Suspense } from "react";
import Slider from "react-slick";
import styled, { createGlobalStyle } from "styled-components";
import getWeb3 from "../../utils/getWeb3";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import { NotificationManager } from "react-notifications";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";

const PremiumNFTLoading = lazy(() => import('./Loading/PremiumNFTLoading'));
const Empty = lazy(() => import("./Empty"));

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  height: 260px;
  overflow: hidden;
  border-radius: 8px;
`;

const GlobalStyles = createGlobalStyle`
  .slick-slide {
    max-width: 324px;
  }
`;

export default function ({ data, status, update }) {

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
          slidesToShow:  list.length >= 4 ? 4 : 1,
          slidesToScroll: 1,
          infinite: true,
        }
      },
      {
        breakpoint: 1600,
        settings: {
          slidesToShow:  list.length >= 4 ? 4 : 1,
          slidesToScroll: 1,
          infinite: true
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow:  list.length >= 3 ? 3 : 1,
          slidesToScroll: 1,
          infinite: true
        }
      },
      {
        breakpoint: 600,
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
    setWEB3(_web3);
    setMarketplace(instanceMarketplace);
    setCarouselLoading(false);
  },[])

  useEffect(() => {
    setList(data);
  }, [data])

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

  return (
    <div className='nft'>
      <Suspense fallback={<div>Loading...</div>}>
        <GlobalStyles/>
        { carouselLoading && <PremiumNFTLoading/> }
        {
          !carouselLoading && (
            <Slider {...settings}>
              {
                list.map((item, index) => {
                  const { auctionData: auction, marketData: market } = item;
                  const price = !auction.existance ? market.price : (auction.currentBidPrice ? auction.currentBidPrice : auction.minPrice);
                  return (
                    <div className='itm' key={index}>
                      <div className="d-item">
                          <div className="nft__item">
                              <div className="nft__item_wrap">
                                <Outer>
                                  <span>
                                      <img src={item.image} className="lazy nft__item_preview" alt=""/>
                                  </span>
                                </Outer>
                              </div>
                              <div className="nft__item_info mb-0">
                                  <span onClick={()=> window.open("/#", "_self")}>
                                      <h4>{item.nftName}</h4>
                                  </span>
                                  <div className="nft__item_price">
                                      {web3.utils.fromWei(price)} BNB
                                  </div>
                                  <div className="nft__item_action">
                                    { (item.nftData.owner).toLowerCase() != (initialUser.walletAddress).toLowerCase() && <span onClick={() => buyNow(item.nftData.tokenID)}>Buy now</span>}
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
  )
}