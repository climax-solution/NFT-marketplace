import React, { useState, useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import getWeb3 from "../../utils/getWeb3";
import NFTItem from "./Profile/sellingNFT";

const Empty = lazy(() => import("./Empty"));
const Loading = lazy(() => import("./Loading/Loading"));

export default function SellingNFT(props) {

    const dispatch = useDispatch();
    const initialUser = useSelector(({ auth }) => auth.user);

    const [nfts, setNFTs] = useState([]);
    const [marketContract, setMarketContract] = useState({});
    const [restList, setRestList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(async() => {
        const { instanceMarketplace:Marketplace } = await getWeb3();
        if (Marketplace) {
            setMarketContract(Marketplace);
            let list = await Marketplace.methods.getPersonalNFTList().call({ from: initialUser.walletAddress });
            list = list.filter(item => item.marketData.existance && item.marketData.marketStatus);
            setRestList(list);
            setLoaded(true);
        }
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
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <InfiniteScroll
                    dataLength={nfts.length}
                    next={fetchNFT}
                    hasMore={restList.length ? true : false}
                    loader={<Loading/>}
                    className="row"
                >
                    { nfts.map( (nft, index) => (
                        <NFTItem data={nft} key={index} Marketplace={marketContract}/>
                    ))}
                </InfiniteScroll>
                {!nfts.length && <Empty/>}
            </Suspense>
        </>
    )
}