import React from 'react';

import SliderMainParticle from '../../components/Home/SliderMainParticle';
import FeatureBox from '../../components/Home/FeatureBox';
import PremiumNFTCarousel from '../../components/Home/PremiumNFTCarousel';
import AuthorList from '../../components/Home/authorList';
import "./style.module.css";

const homeone= () => {
  return (
    <div>
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
    </div>
  )
}
export default homeone;