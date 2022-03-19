import React, { useEffect, useState, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import getWeb3 from "../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from 'styled-components';

const Footer = lazy(() => import('../components/footer'));
const TradeNFT = lazy(() => import("../components/FolderNFT/tradeNFT"));
const Banner = lazy(() => import("../components/Collection/banner"));
const PremiumNFTLoading = lazy(() => import("../components/Loading/PremiumNFTLoading"));
const Empty = lazy(() => import("../components/Empty"));

const GlobalStyles = createGlobalStyle`
    .btn-apply {
      background: #3fb737;
    }

    .btn-apply:hover {
      box-shadow: 2px 2px 20px 0px #3fb737;
    }
    .groups {
      display: grid;
      grid-template-columns: auto auto;
      column-gap: 15px;
    }
`;

const Collection= function() {
  const params = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [nfts, setNFTs] = useState([]);
  const [restList, setRestList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(async () => {
    const { username } = params;
    const { instanceNFT } = await getWeb3();
    await axios.post(`${process.env.REACT_APP_BACKEND}user/get-user-by-username`, { username }).then(async(res) => {
      const { data } = res;
      let _list = await instanceNFT.methods.getPersonalNFT(data.walletAddress).call();
      let sellingList = [];
      _list = _list.filter(item => (item.owner).toLowerCase() == (data.walletAddress).toLowerCase());
      await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-sale-list`, { walletAddress: data.walletAddress }).then(res => {
          const { list } = res.data;
          let keys = [];
          list.map(item => {
              keys.push((item.tokenID).toString());
          });
          _list = _list.map(item => {
              const index = keys.indexOf(item.tokenID);
              if (index > -1) {
                sellingList.push({ ...item, ...list[index]});
              } else sellingList.push(item);
          });
      }).catch(err => {

      });
      setRestList(sellingList);
      setUserData(data);
      setLoaded(true);
      setLoading(false);
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

  return (
    <div>
      <GlobalStyles/>
        {
          isLoading ? <Loading/>
          : (
          <>
            <Banner userData={userData} />
            <section className='container no-top'>
              <InfiniteScroll
                dataLength={nfts.length}
                next={fetchNFT}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="row"
              >
                {
                  nfts.map( (nft, index) => (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4 position-relative" key={index}>
                      <TradeNFT data={nft}/>
                    </div>
                    )
                  )
                }
              </InfiniteScroll>
              {
                loaded && !nfts.length && !restList.length && <Empty/>
              }
            </section>
          </>
          )
        }
        <Footer />
    </div>
  );
}
export default Collection;