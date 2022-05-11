import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import getWeb3 from "../../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";

import TradeNFT from "../../components/FolderNFT/tradeNFT";
import Banner from "../../components/Collection/banner";
import PremiumNFTLoading from "../../components/Loading/PremiumNFTLoading";
import Empty from "../../components/Empty";
import Loading from "../../components/Loading/Loading";
import "./style.css";

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
                    <TradeNFT data={nft} key={index}/>
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
    </div>
  );
}
export default Collection;