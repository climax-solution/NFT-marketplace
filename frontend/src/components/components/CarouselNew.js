import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import styled, { createGlobalStyle } from "styled-components";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Clock from "./Clock";
import Empty from "./Empty";
import getWeb3 from "../../utils/getWeb3";
import PremiumNFTLoading from './Loading/PremiumNFTLoading';

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
export default function ({ data }) {
  const [list, setList] = useState([]);
  const [web3, setWEB3] = useState([]);
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
    const { _web3 } = await getWeb3();
    setWEB3(_web3);
    setCarouselLoading(false);
  },[])
  useEffect(() => {
    setList(data);
  },[data])

  return (
    <div className='nft'>
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
                            <div className="de_countdown">
                              {/* <Clock deadline={this.state.deadline2} /> */}
                            </div>
                            <div className="author_list_pp">
                                <span onClick={()=> window.open("/#", "_self")}>                                    
                                    <img className="lazy" src="./img/author/author-2.jpg" alt=""/>
                                    <i className="fa fa-check"></i>
                                </span>
                            </div>
                            <div className="nft__item_wrap">
                              <Outer>
                                <span>
                                    <img src={item.image} className="lazy nft__item_preview" alt=""/>
                                </span>
                              </Outer>
                            </div>
                            <div className="nft__item_info">
                                <span onClick={()=> window.open("/#", "_self")}>
                                    <h4>{item.nftName}</h4>
                                </span>
                                <div className="nft__item_price">
                                    {web3.utils.fromWei(price)} BNB
                                </div>    
                                <div className="nft__item_action">
                                    <span onClick={()=> window.open("/#", "_self")}>Place a bid</span>
                                </div>
                                <div className="nft__item_like">
                                    <i className="fa fa-heart"></i><span>45</span>
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
    </div>
  )
}