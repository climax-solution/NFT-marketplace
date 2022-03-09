import React from 'react';
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
import { createGlobalStyle } from 'styled-components';
import { Link, useNavigate } from "react-router-dom";

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
const inline = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
  .d-inline{
    display: inline-block;
   }
`;

const GlobalStyles = createGlobalStyle`
  p.lead{
    color: #a2a2a2;
  }
  #tsparticles{
    top: 0;
  }
`;

const slidermainparticle= () => {

  const navigate = useNavigate();
  
  return (
    <>
      <GlobalStyles/>
      <div className="container">
        <div className="row align-items-center">
            <div className="col-md-6">
                <div className="spacer-single"></div>
                <h6> <span className="text-uppercase color">NFT Developments Marketplace</span></h6>
                <Reveal className='onStep' keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
                <h1 className="col-white"> Create, Sell and Collect Quality NFTs</h1>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
                <p className="lead col-white">
                NFTD is the place for you to buy quality music, video, image and real world asset backed NFTs
                </p>
                </Reveal>
                <div className="spacer-10"></div>
                <Reveal className='onStep d-inline' keyframes={inline} delay={800} duration={900} triggerOnce>
                <Link to={`/explore`} className="btn-main inline lead">Explore</Link>
                {/* <span onClick={()=> navigate('/explore')} className="btn-main inline lead">Explore</span> */}
                <div className="mb-sm-30"></div>
                </Reveal>
            </div>
            <div className="col-md-6 xs-hide">
              <Reveal className='onStep d-inline' keyframes={inline} delay={300} duration={1200} triggerOnce>
                  <img src="./img/misc/banner-mark.webp" className="img-fluid w-100 h-100" alt=""/>
              </Reveal>
            </div>
        </div>
      </div>
    </>
    
  )
}
export default slidermainparticle;