import React, { useEffect, useState, useRef } from "react";
import ColumnZero from '../components/ColumnZero';
import ColumnZeroTwo from '../components/ColumnZeroTwo';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import getWeb3 from "../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "../components/Loading";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;

const Collection= function() {
  const params = useParams();
  const navigate = useNavigate();
  const [Marketplace, setMarketplace] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [userData, setUserData] = useState({});
  const [nfts, setNFTs] = useState([]);
  const [restList, setRestList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(async () => {
    const { username } = params;
    const { instanceMarketplace, _web3 } = await getWeb3();
    setWeb3(_web3);
    setMarketplace(instanceMarketplace);
    await axios.post('http://localhost:7060/user/get-user-by-username', { username }).then(res => {
      const { data } = res;
      setUserData(data);
    }).catch(err => {
      navigate('/404');
    })
  },[])

  useEffect(async() => {
    if (userData?.walletAddress && Marketplace) {
      let list = await Marketplace.methods.getPersonalNFTList().call({ from: userData.walletAddress });
      list = list.filter(item => item.marketData.existance);
      setRestList(list);
      setLoaded(true);
    }
  },[userData])

  useEffect(async() => {
    if (loaded) {
      await fetchNFT();
      setLoaded(false);
    }
  },[loaded])

  const fetchNFT = async() => {
    if (!restList.length) return;
    let tmpList = restList;
    if (tmpList.length > 8) {
      tmpList = tmpList.slice(0, 8);
      setRestList(restList.slice(8, restList.length));
    }
    else setRestList([]);
    let mainList = [];
    for await (let item of tmpList) {
      await axios.get(item.nftData.tokenURI).then(res => {
        mainList.push(res.data);
      })
    }

    setNFTs([...nfts, ...mainList]);
  }

  return (
    <div>
      <GlobalStyles/>

      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/img/background/4.jpg'})`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>

      <section className='container d_coll no-top no-bottom'>
        <div className='row'>
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                  <div className="d_profile_img">
                    <img src={`http://localhost:7060/avatar/${userData.avatar}`} alt="" crossOrigin="true"/>
                    <i className="fa fa-check"></i>
                  </div>
                  
                  <div className="profile_name">
                    <h4>
                      {userData.firstName + " " + userData.lastName}                                                
                      <div className="clearfix mt-2"></div>
                      <span id="wallet" className="profile_wallet">{ userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                      <button id="btn_copy" title="Copy Text">Copy</button>
                    </h4>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container no-top'>
          <InfiniteScroll
            dataLength={nfts.length}
            next={fetchNFT}
            hasMore={restList.length ? true : false}
            loader={<Loading/>}
            className="row"
          >
            {
              nfts.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                    <div className="nft__item">
                        <div className="nft__item_wrap">
                            <a>
                                <img src={nft.image} className="lazy nft__item_preview" alt=""/>
                            </a>
                        </div>
                        <div className="nft__item_info">
                            <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                <h4>{nft.nftName}</h4>
                            </span>
                            <div className="nft__item_price">
                                {/* {web3.utils.fromWei(nft.marketData.price, "ether")} BNB */}
                            </div>
                        </div> 
                    </div>
                </div>
                )
              )
            }
          </InfiniteScroll>
      </section>


      <Footer />
    </div>
  );
}
export default Collection;