import React from 'react';
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
import { createGlobalStyle } from 'styled-components';

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;

const GlobalStyles = createGlobalStyle`
  .feature-box.style-3 i.wm{
    color: rgba(131,100,226, .1);
  }

`;

const featurebox= () => (
  <>
    <GlobalStyles/>
    <div className='row'>
        <div className="col-lg-4 col-md-6 mb-3">
            <div className="feature-box f-boxed style-3">
              <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <i className="bg-color-2 i-boxed icon_wallet"></i>
              </Reveal>
                <div className="text">
                  <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                    <h4 className="">Set up your wallet</h4>
                  </Reveal>
                  <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                    <p className="">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.</p>
                  </Reveal>
                </div>
                <i className="wm icon_wallet"></i>
            </div>
        </div>

      <div className="col-lg-4 col-md-6 mb-3">
          <div className="feature-box f-boxed style-3">
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <i className=" bg-color-2 i-boxed icon_cloud-upload_alt"></i>
            </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Add your NFT's</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Click here to learn how to add your NFTs to the NFTD Marketplace.</p>
                </Reveal>
              </div>
              <i className="wm icon_cloud-upload_alt"></i>
          </div>
      </div>

      <div className="col-lg-4 col-md-6 mb-3">
          <div className="feature-box f-boxed style-3">
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <i className=" bg-color-2 i-boxed icon_tags_alt"></i>
            </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Sell your NFT's</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Click here to learn how to sell your NFTs to the NFTD Marketplace.</p>
                </Reveal>
              </div>
              <i className="wm icon_tags_alt"></i>
          </div>
      </div>
    </div>
  </>
);
export default featurebox;