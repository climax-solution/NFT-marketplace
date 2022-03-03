import React, { useEffect, useState, lazy, Suspense } from "react";
import { createGlobalStyle } from 'styled-components';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import getWeb3 from "../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";
import { NotificationManager } from "react-notifications";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import NFTItem from "../components/Collection/nftItem";

const Loading = lazy(() => import("../components/Loading/Loading"));
const Footer = lazy(() => import('../components/footer'));

const GlobalStyles = createGlobalStyle`
  .ratio-1-1 {
    aspect-ratio: 1;
  }
`;

const Collection= function() {
  const params = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [nfts, setNFTs] = useState([]);
  const [restList, setRestList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(async () => {
    const { username } = params;
    const { instanceMarketplace } = await getWeb3();
    await axios.post('http://nftdevelopments.co.nz/user/get-user-by-username', { username }).then(async(res) => {
      const { data } = res;
      let list = await instanceMarketplace.methods.getPersonalNFTList().call({ from: data.walletAddress });
      list = list.filter(item => item.marketData.existance);
      setRestList(list);
      setUserData(data);
      setLoaded(true);
    }).catch(err => {
      navigate('/404');
    })
  },[])
  useEffect(async() => {
    if (loaded) {
      await fetchNFT();
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
    setNFTs([...nfts, ...tmpList]);
  }

  const copyAlert = () => {
    NotificationManager.info("Copied");
  }

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
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
                      <img src={`http://nftdevelopments.co.nz/avatar/${userData.avatar}`} className="ratio-1-1" alt="" crossOrigin="true"/>
                      <i className="fa fa-check"></i>
                    </div>
                    
                    <div className="profile_name">
                      <h4>
                        {userData.firstName + " " + userData.lastName}
                      </h4>
                      <div className="d-flex justify-content-center">
                        <span id="wallet" className="profile_wallet mx-2">{ userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                        <CopyToClipboard
                          text={userData.walletAddress}
                          onCopy={copyAlert}
                        >
                          <button id="btn_copy" className="position-relative">Copy</button>
                        </CopyToClipboard>
                      </div>
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
                    <NFTItem data={nft} key={index}/>
                  )
                )
              }
            </InfiniteScroll>
            {
              !loaded && <Loading/>
            }
        </section>
        <Footer />
      </Suspense>
    </div>
  );
}
export default Collection;