import React, { useEffect, useState, lazy, Suspense } from "react";
import { createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Carousel from "react-multi-carousel";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import getWeb3 from "../../utils/getWeb3";

import "react-multi-carousel/lib/styles.css";


const PremiumNFTLoading = lazy(() => import('./Loading/PremiumNFTLoading'));
const Empty = lazy(() => import("./Empty"));
const MusicArt = lazy(() => import("./Asset/music"));
const VideoArt = lazy(() => import("./Asset/video"));

const GlobalStyles = createGlobalStyle`
  .slick-track {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .text-grey {
    color: #a2a2a2;
  }

  .nft__item {
    height: calc(100% - 20px);
  }
`;

export default function () {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialUser = useSelector(({ auth }) => auth.user);
  const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

  const [list, setList] = useState([]);
  const [web3, setWEB3] = useState([]);
  const [Marketplace, setMarketplace] = useState([]);
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

  useEffect(async () => {
    const { _web3, instanceMarketplace } = await getWeb3();
    setWEB3(_web3);
    setMarketplace(instanceMarketplace);
  },[])

  useEffect(async() => {
    if (Marketplace) await fetchNFT();
  },[initialUser, Marketplace])

  const buyNow = async(id) => {
  
    if (!wallet_info) {
      toast.warning('Please connect metamask', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
      return;
    }

    try {

        dispatch(UPDATE_LOADING_PROCESS(true));
        let { marketData, auctionData } = await Marketplace.methods.getItemNFT(id).call();
        if (marketData.marketStatus && !auctionData.existance) {

            const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);

            if (Number(marketData.price) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

            await Marketplace.methods.buyNFT(id).send({ from: initialUser?.walletAddress, value: marketData.price });

            const data = {
                tokenID: id,
                type: 0,
                price: marketData.price,
                walletAddress: initialUser?.walletAddress
            }

            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            }).catch(err => { });

            toast.success("Buy success", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored"
            });
        }
    } catch(err) {
        toast.error(err.message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored"
        });
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
          mainList.push({ ...item, ...data });
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
        <Suspense fallback={<PremiumNFTLoading/>}>
          <GlobalStyles/>
          { carouselLoading && <PremiumNFTLoading/> }
          {
            !carouselLoading && (
              <Carousel
                swipeable={false}
                draggable={false}
                responsive={responsive}
                ssr // means to render carousel on server-side.
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={2000}
                keyBoardControl={true}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
              >
                {
                  list.map((nft, index) => {
                    console.log(list);
                      const { auctionData: auction, marketData: market } = nft;
                      const price = !auction.existance ? market.price : (auction.currentBidPrice ? auction.currentBidPrice : auction.minPrice);
                      return (
                        <div className="nft__item justify-content-between" key={index}>
                            <div className="nft__item_wrap">
                              {
                                  (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} onClick={() => navigate(`/item-detail/${nft.nftData.tokenID}`)} className="lazy nft__item_preview ratio-1-1" alt="" role="button"/>
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
                      )
                  })
                }
              </Carousel>
            )
          }
          { !list.length && !carouselLoading && <Empty/> }
          </Suspense>
      </div>
    </section>
  )
}