import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import getWeb3 from "../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";

const Loading = lazy(() => import("../components/Loading/Loading"));
const Footer = lazy(() => import('../components/footer'));
const NFTItem = lazy(() => import("../components/Collection/nftItem"));
const Banner = lazy(() => import("../components/Collection/banner"));

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

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Banner userData={userData} />
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