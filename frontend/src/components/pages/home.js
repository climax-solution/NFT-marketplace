import React, { lazy, Suspense } from 'react';
import { createGlobalStyle } from 'styled-components';
import Loading from '../components/Loading/Loading';

const Particle = lazy(() => import('../components/Particle'));
const SliderMainParticle = lazy(() => import('../components/SliderMainParticle'));
const FeatureBox = lazy(() => import('../components/FeatureBox'));
const PremiumNFTCarousel = lazy(() => import('../components/PremiumNFTCarousel'));
const AuthorList = lazy(() => import('../components/authorList'));
const Footer = lazy(() => import('../components/footer'));

const GlobalStyles = createGlobalStyle`
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
  return (
    <div>
      <Suspense fallback={<Loading/>}>
        <GlobalStyles />
        <section className="jumbotron no-bg" style={{backgroundImage: `url(${'./img/background/bg.webp'})`}}>
          <Particle/>
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
  
        <Footer />
      </Suspense>
    </div>
  )
}
export default homeone;