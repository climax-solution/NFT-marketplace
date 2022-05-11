import React from 'react';
import { createGlobalStyle } from "styled-components";
import SliderMainParticle from '../../components/Home/SliderMainParticle';
import FeatureBox from '../../components/Home/FeatureBox';
import PremiumNFTCarousel from '../../components/Home/PremiumNFTCarousel';
import AuthorList from '../../components/Home/authorList';
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

const Home= () => {
  return (
    <>
      <GlobalStyle/>
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
  )
}
export default Home;