import React, { useEffect, useState, lazy } from "react";
import { createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import axios from "axios";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const PremiumNFTLoading = lazy(() => import('../Loading/PremiumNFTLoading'));
const Empty = lazy(() => import("../Empty"));
const TradeNFT  = lazy(() => import( "../FolderNFT/tradeNFT"));

const GlobalStyles = createGlobalStyle`
  .text-grey {
    color: #a2a2a2;
  }

  .nft__item {
    height: calc(100% - 20px);
  }

  .btn-apply {
    background: #3fb737;
  }

  .btn-apply:hover {
      box-shadow: 2px 2px 20px 0px #3fb737;
  }

  .groups {
      display: grid;
      grid-template-columns: auto auto;
      column-gap: 15px;
  }
  .carousel-item-padding-40-px {
    transform-style: unset !important;
  }
`;

export default function () {
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
      let list = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-premium-list`).then(res => {
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
    <section className='container no-top no-bottom'>
      <div className='row'>
        <div className="spacer-double"></div>
        <div className='col-lg-12 mb-2'>
            <h2>Premium NFTs</h2>
        </div>
      </div> 
      <div className='nft'>
        <>
          <GlobalStyles/>
          { carouselLoading && <PremiumNFTLoading/> }
          {
            !carouselLoading && (
              <>
                <Carousel
                  swipeable={false}
                  draggable={false}
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
          </>
      </div>
    </section>
  )
}