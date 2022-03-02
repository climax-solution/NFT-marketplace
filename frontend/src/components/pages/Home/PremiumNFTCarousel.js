import React, { useEffect, useState, lazy, Suspense } from "react";
import Slider from "react-slick";
import { createGlobalStyle } from "styled-components";
import getWeb3 from "../../../utils/getWeb3";
import { useSelector, useDispatch } from "react-redux";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import PremiumNFT from "./PremiumNFT";

const PremiumNFTLoading = lazy(() => import('../../components/Loading/PremiumNFTLoading'));
const Empty = lazy(() => import("../../components/Empty"));

const GlobalStyles = createGlobalStyle`
  .slick-slide {
    max-width: 324px;
  }
`;
export default function () {

  const initialUser = useSelector(({ auth }) => auth.user);
  const [list, setList] = useState([]);
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

  useEffect(async() => {
    if (initialUser.walletAddress == undefined) return;
    try {
      const { instanceMarketplace } = await getWeb3();
      let list = await instanceMarketplace.methods.getPremiumNFTList().call();
      list = list.filter(item => item.marketData.premiumStatus);
      list.sort((before, after) => before.marketData.price - after.marketData.price);
      if (list.length > 10) list = list.slice(0, 10);
      // let mainList = [];
      // for await (let item of list) {
      //   await axios.get(item.nftData.tokenURI).then(res => {
      //     const { data } = res;
      //     mainList.push({ ...item, ...data});
      //   })
      // }
      setList(list);
    } catch(err) { }
    setCarouselLoading(false);
  },[initialUser])

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
                  return (
                    <PremiumNFT data={item} key={index}/>
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