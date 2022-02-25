import React, { useEffect, useState } from 'react';
import axios from "axios";
import Particle from '../components/Particle';
import SliderMainParticle from '../components/SliderMainParticle';
import FeatureBox from '../components/FeatureBox';
import CarouselCollection from '../components/CarouselCollection';
import PremiumNFTCarousel from '../components/PremiumNFTCarousel';
import AuthorList from '../components/authorList';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import getWeb3 from "../../utils/getWeb3";
import PremiumNFTLoading from '../components/Loading/PremiumNFTLoading';
import TopSellerLoading from '../components/Loading/TopSellerLoading';
import { useSelector } from 'react-redux';

const GlobalStyles = createGlobalStyle`
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  .item-dropdown{
    .dropdown{
      a{
        &:hover{
          background: #8364e2;
        }
      }
    }
  }
  .btn-main{
    background: #8364e2;
    &:hover{
      box-shadow: 2px 2px 20px 0px #8364e2;
    }
  }
  p.lead{
    color: #a2a2a2;
  }
  .navbar .navbar-item .lines{
    border-bottom: 2px solid #8364e2;
  }
  .jumbotron.no-bg{
    height: 100vh;
    overflow: hidden;
    background-repeat: repeat;
    background-size: cover;
    background-position: bottom;
    background-repeat: no-repeat;
  }
  #tsparticles{
    top: 0;
  }
  .text-uppercase.color{
    color: #8364e2;
  }
  .de_count h3 {
    font-size: 36px;
    margin-bottom: 0px;
  }
  .de_count h5{
    font-size: 14px;
    font-weight: 500;
  }
  h2 {
    font-size: 30px;
  }
  .box-url{
    text-align: center;
    h4{
      font-size: 16px;
    }
  }
  .de_countdown{
    border: solid 2px #8364e2;
  }
  .author_list_pp, .author_list_pp i, 
  .nft_coll_pp i, .feature-box.style-3 i, 
  footer.footer-light #form_subscribe #btn-subscribe i, 
  #scroll-to-top div{
    background: #8364e2;
  }
  footer.footer-light .subfooter .social-icons span i{
    background: #403f83;
  }
  .author_list_pp:hover img{
    box-shadow: 0px 0px 0px 2px #8364e2;
  }
  .nft__item_action span{
    color: #8364e2;
  }
  .feature-box.style-3 i.wm{
    color: rgba(131,100,226, .1);
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
  .ratio-1-1 {
    aspect-ratio: 1;
  }
`;


const homeone= () => {

  const initialUser = useSelector(({auth}) => auth.user);
  const [topPreimumNFTs, setTopPreimumNFTs] = useState([]);
  const [topSeller, setTopSeller] = useState([]);
  const [hotCollection, setHotCollection] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [carouselUpdated, setCarouselUpdated] = useState(false);

  useEffect(async() => {
    if (initialUser.walletAddress == undefined) return;
    try {
      const { instanceMarketplace } = await getWeb3();
      let list = await instanceMarketplace.methods.getPremiumNFTList().call();
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
      for await (let item of mainList) {
        await axios.post(
          'http://nftdevelopments.co.nz/activity/get-likes',
          { tokenID: item.nftData.tokenID, walletAddress: initialUser?.walletAddress }
        ).then(res => {
          const { liked, lastAct } = res.data;
          item["liked"] = liked; item["lastAct"] = lastAct;
        })
      }
      
      setTopPreimumNFTs(mainList);
    } catch(err) { }
    setCarouselLoading(false);
  },[carouselUpdated, initialUser ])

  useEffect(async() => {
    await axios.post('http://nftdevelopments.co.nz/activity/get-top-sellers').then(res => {
      setTopSeller(res.data);
      setSellerLoading(false);
    }).catch(err => {
      setSellerLoading(false);
    })
  },[]);

  return (
    <div>
    <GlobalStyles />
        <section className="jumbotron no-bg" style={{backgroundImage: `url(${'./img/background/8.jpg'})`}}>
         <Particle/>
           <SliderMainParticle/>
        </section>
    
        <section className='container no-top no-bottom'>
          <div className='row'>
            <div className="spacer-double"></div>
            <div className='col-lg-12 mb-2'>
                <h2>Premium NFTs</h2>
            </div>
          </div> 
          { carouselLoading ? <PremiumNFTLoading/> : <PremiumNFTCarousel data={topPreimumNFTs} update={setCarouselUpdated} status={carouselUpdated}/>}
        </section>
  
        <section className='container no-top no-bottom'>
          <div className='row'>
            <div className="spacer-double"></div>
            <div className='col-lg-12'>
                <h2>Top Sellers</h2>
            </div>
            <div className='col-lg-12 mt-5'>
              { sellerLoading ? <TopSellerLoading/> : <AuthorList data={topSeller}/>}
            </div>
          </div>
        </section>
    
        <section className='container no-top'>
          <div className='row'>
              <div className="spacer-double"></div>
              <div className='col-lg-12 mb-3'>
                <h2>Create and Sell Now</h2>
              </div>
              <FeatureBox/>
          </div>
        </section>
  
      <Footer />
  
    </div>
  )
}
export default homeone;