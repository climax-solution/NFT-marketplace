import React, { useEffect, useState, lazy } from "react";
import { createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";
import Modal from 'react-awesome-modal';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Carousel from "react-multi-carousel";
import getWeb3 from "../../../utils/getWeb3";

import "react-multi-carousel/lib/styles.css";


const PremiumNFTLoading = lazy(() => import('../Loading/PremiumNFTLoading'));
const Empty = lazy(() => import("../Empty"));
const MusicArt = lazy(() => import("../Asset/music"));
const VideoArt = lazy(() => import("../Asset/video"));

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
  const [visible, setVisible] = useState(false);
  const [isTrading, setTrading] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [activeID, setActiveID] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(-1);

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

    setActiveID(id);
    try {
        // dispatch(UPDATE_LOADING_PROCESS(true));
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
      console.log(err);
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
    await fetchNFT();
    setActiveID(-1);
    // dispatch(UPDATE_LOADING_PROCESS(false));
  }

  const placeBid = async() => {

    let message = "";
    if (!initialUser.walletAddress) message = 'Please log in';
    else if (!wallet_info) message = 'Please connect metamask';
    else if (bidPrice <= 0) message = 'Please reserve correct price';

    let {auctionData} = await Marketplace.methods.getItemNFT(activeID).call();

    if (bidPrice > 0) {
      let minPrice = web3.utils.fromWei(auctionData.minPrice, "ether");
      if (bidPrice < minPrice) message = 'Offer is over min price';
    }

    if (message) {
        toast.warning(message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
        return;
    }

    if (auctionData.existance) {
       try {
            const price = web3.utils.toWei(bidPrice.toString(), "ether");
            const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);

            if (Number(price) + 210000 > Number(_bnbBalance)) throw new Error("BNB balance is low");

            setTrading(true);
            setBidPrice('');
            await Marketplace.methods.placeBid(activeID).send({ from: initialUser.walletAddress, value: price});
            const data = {
                tokenID: activeID,
                type: 7,
                price: Number(price),
                walletAddress: initialUser.walletAddress
            }

            await axios.post('http://nftdevelopments.co.nz/activity/create-log', data).then(res =>{

            }).catch(err => { });
            toast.success("Success Bid", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            let lists = [ ...list];
            lists.splice(activeIndex, 1);
            setList(lists);
        } catch(err) {
            toast.error(err.message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
       }
      await fetchNFT();
      setActiveID(-1);
      setActiveIndex(-1);
      setTrading(false);
      setVisible(false);
    }
  }

  const withdrawBid = async(id) => {
    let message = "";
    if (!initialUser.walletAddress) message = 'Please log in';
    if (!wallet_info) message = 'Please connect metamask';
    if (message) {
        toast.warning(message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
        return;
    }

    setActiveID(id);
    try {
        const _bnbBalance = await web3.eth.getBalance(initialUser.walletAddress);

        if (Number(_bnbBalance) < 210000 ) throw new Error("BNB balance is low");

        setTrading(true);
        await Marketplace.methods.withdrawBid(id).send({ from: initialUser.walletAddress });

        toast.info("Success withdraw", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
        await refresh();
    } catch(err) {
        toast.error(err.message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
    }
    await fetchNFT();
    setActiveID(-1);
    setTrading(false);
  }

  const fetchNFT = async() => {
    if (initialUser.walletAddress == undefined) return;
    setCarouselLoading(true);
    try {
      let list = await Marketplace.methods.getPremiumNFTList().call();
      list = list.filter(item => item.marketData.premiumStatus && item.marketData.marketStatus);
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

  const openModal = (id, index) => {
    let message = '';
    if (!initialUser.walletAddress) message = 'Please log in';
    else if (!wallet_info) message = 'Please connect metamask';
    if (message) {
      toast.warning(message, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored"
      });
      return;
    }

    setActiveID(id);
    setActiveIndex(index);
    setVisible(true);

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
                    const bidOwner = (nft.auctionData.currentBidOwner).toLowerCase() == (initialUser.walletAddress).toLowerCase();
                    const { auctionData: auction, marketData: market } = nft;
                    const price = !auction.existance ? market.price : auction.minPrice;
                    return (
                      <div className="nft__item position-relative justify-content-between" key={index}>
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
                                {
                                  (
                                    nft.nftData.owner).toLowerCase() != (initialUser.walletAddress).toLowerCase() ? 
                                    (
                                      nft.auctionData.existance ? ( !bidOwner ? <span onClick={() => openModal(nft.nftData.tokenID, index) }>Place bid</span> : <span onClick={() => withdrawBid(nft.nftData.tokenID, index) }>Withdraw bid</span>)
                                      : <span onClick={() => buyNow(nft.nftData.tokenID, index)}>Buy now</span>
                                    ) : ""
                                }
                              </div>
                          </div>
                          {
                            activeID == nft.nftData.tokenID && 
                            <div className="trade-loader w-100 start-0">
                                <div className="nb-spinner"></div>
                            </div>
                          }
                      </div>
                    )
                  })
                }
              </Carousel>
              <Modal
                visible={visible}
                width="300"
                height="200"
                effect="fadeInUp"
                onClickAway={null}
              >
                {
                  isTrading ?
                  <div className='d-flex w-100 h-100 justify-content-center align-items-center'>
                    <div className='reverse-spinner'></div>
                  </div>
                  : 
                  <div className='p-5'>
                    <div className='form-group'>
                        <label>Please reserve price.</label>
                        <input
                            type="number"
                            className='form-control text-dark border-dark'
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                        />
                    </div>
                    <div className='groups'>
                        <button
                            className='btn-main btn-apply w-100 px-1'
                            onClick={placeBid}
                        >Place</button>
                        <button
                            className='btn-main w-100'
                            onClick={() => setVisible(false)}
                        >Cancel</button>
                    </div>
                  </div>
                }

            </Modal>
            </>
            )
          }
          { !list.length && !carouselLoading && <Empty/> }
          </>
      </div>
    </section>
  )
}