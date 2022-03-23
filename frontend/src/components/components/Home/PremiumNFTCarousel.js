import React, { useEffect, useState, lazy } from "react";
import { createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import axios from "axios";
import Modal from 'react-awesome-modal';
import { toast } from "react-toastify";
import Carousel from "react-multi-carousel";
import getWeb3 from "../../../utils/getWeb3";
import { offerSign } from "../../../utils/sign";
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
  const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

  const [list, setList] = useState([]);
  const [web3, setWEB3] = useState([]);
  const [Marketplace, setMarketplace] = useState({});
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
            setTrading(true);
            setBidPrice('');
            
            const data = {
                tokenID: activeID,
                type: 7,
                price: Number(price),
                walletAddress: initialUser.walletAddress
            }

            const nonce = await Marketplace.methods.nonces(initialUser.walletAddress).call();
            const result = await offerSign(nonce, activeID, initialUser.walletAddress, price, false);

            const offer = {
              tokenID: activeID,
              price,
              walletAddress: initialUser.walletAddress,
              signature: result
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/create-new-offer`, offer).then(res => {
              const { message } = res.data;
              toast.success(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
              });
            }).catch(err => {
              const { error } = err.response.data;
              toast.success(error, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
              });
            })

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
                      return (
                        <TradeNFT className={""} data={nft} key={index}/>
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
              { !list.length && <Empty/> }
            </>
            )
          }
          </>
      </div>
    </section>
  )
}