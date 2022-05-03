import React from 'react';
import { createGlobalStyle } from 'styled-components';

import SliderMainParticle from '../components/Home/SliderMainParticle';
import FeatureBox from '../components/Home/FeatureBox';
import PremiumNFTCarousel from '../components/Home/PremiumNFTCarousel';
import AuthorList from '../components/Home/authorList';

const GlobalStyles = createGlobalStyle`
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
    overflow: hidden;
    background-repeat: repeat;
    background-size: cover;
    background-position: bottom;
    background-repeat: no-repeat;
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
  .de_countdown{
    border: solid 2px #8364e2;
  }
  .author_list_pp i, 
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
  
  @media only screen and (max-width: 1199px) {
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
  }
`;


const homeone= () => {
  return (
    <div>
      <>
        <GlobalStyles />
        <section className="jumbotron no-bg" style={{backgroundImage: `url(${'./img/background/bg.webp'})`}}>
          <SliderMainParticle/>
        </section>
        
        <PremiumNFTCarousel/>
        
        <AuthorList/>
        
        <section className='container no-top'>
          <div className='row'>
              <div className="spacer-double"></div>
              <div className='col-lg-12 mb-3'>
                <h2>Create and Sell Now</h2>
              </div>
              <FeatureBox/>
          </div>
        </section>
      </>
    </div>
  )
}
export default homeone;