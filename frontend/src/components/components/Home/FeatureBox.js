import React from 'react';
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
import { createGlobalStyle } from "styled-components";
import style from "./style/feature.js";
const GlobalStyle = createGlobalStyle`${style}`;

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


const FeatureBox= () => (
  <>
    <GlobalStyle/>
    <div className='row'>
      <div className="col-lg-4 col-md-6 mb-3">
          <div className="feature-box f-boxed h-100 style-3">
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <i className="bg-color-2 i-boxed fas fa-wallet"></i>
            </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Set up your wallet</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Click here to learn how to set your wallet up to accept Binance token and interact with the NFTD Market Place.</p>
                </Reveal>
              </div>
              <i className="wm fas fa-wallet"></i>
          </div>
      </div>

      <div className="col-lg-4 col-md-6 mb-3">
          <div className="feature-box f-boxed h-100 style-3">
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <i className=" bg-color-2 i-boxed fas fa-cloud-upload"></i>
            </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Add your NFT's</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Click here to learn how to add your NFTs to the NFTD Marketplace.</p>
                </Reveal>
              </div>
              <i className="wm fas fa-cloud-upload"></i>
          </div>
      </div>

      <div className="col-lg-4 col-md-6 mb-3">
          <div className="feature-box f-boxed h-100 style-3">
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <i className=" bg-color-2 i-boxed fas fa-tags"></i>
            </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Sell your NFT's</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Click here to learn how to sell your NFTs to the NFTD Marketplace.</p>
                </Reveal>
              </div>
              <i className="wm fas fa-tags"></i>
          </div>
      </div>
    </div>
  </>
);
export default FeatureBox;