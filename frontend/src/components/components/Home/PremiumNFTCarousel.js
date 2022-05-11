import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Carousel from "react-multi-carousel";
import { createGlobalStyle } from "styled-components";
import "react-multi-carousel/lib/styles.css";
import style from "./style/premium.js";

import PremiumNFTLoading from '../Loading/PremiumNFTLoading';
import Empty from "../Empty";
import TradeNFT  from  "../FolderNFT/tradeNFT";
const GlobalStyle = createGlobalStyle`${style}`;

export default function PremiumNFTCarousel() {
  const initialUser = useSelector(({ auth }) => auth.user);

  const [list, setList] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1200 },
      items: 4
    },
    tablet: {
      breakpoint: { max: 1200, min: 600 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1
    }
  };
  useEffect(async() => {
    await fetchNFT();
  },[initialUser])

  const fetchNFT = async() => {
    if (initialUser.walletAddress == undefined) return;
    setCarouselLoading(true);
    try {
      let list = await axios.post(
        `${process.env.REACT_APP_BACKEND}sale/get-premium-list`,
        {
          walletAddress: initialUser?.walletAddress ? initialUser.walletAddress : ""
        }
      ).then(res => {
        return res.data.list;
      });
      list.sort((before, after) => before.price - after.price);
      setList(list);
    } catch(err) {
      console.log(err);
    }
    setCarouselLoading(false);
  }

  return (
    <>
      <GlobalStyle/>
      <section className='container no-top no-bottom'>
        <div className='row'>
          <div className="spacer-double"></div>
          <div className='col-lg-12 mb-2'>
              <h2>Premium NFTs</h2>
          </div>
        </div> 
        <div className='nft'>
            { carouselLoading && <PremiumNFTLoading/> }
            {
              !carouselLoading && (
                <>
                  <Carousel
                    swipeable={false}
                    draggable={false}
                    ssr
                    responsive={responsive}
                    infinite={true}
                    autoPlay={false}
                    autoPlaySpeed={2000}
                    keyBoardControl={true}
                    containerClass="carousel-container"
                    removeArrowOnDeviceType={["tablet", "mobile"]}
                    dotListClass="custom-dot-list-style"
                    itemClass="carousel-item-padding-40-px"
                  >
                    {
                      list.map((nft, index) => {
                        return (
                          <TradeNFT className={""} data={nft} key={index}/>
                        )
                      })
                    }
                  </Carousel>
                { !list.length && <Empty/> }
              </>
              )
            }
        </div>
      </section>
    </>
  )
}