import React, { useState, useEffect, lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import getWeb3 from "../../utils/getWeb3";
import Loading from "./Loading/Loading";
import { createGlobalStyle } from "styled-components";

const Empty = lazy(() => import("./Empty"));
const NFTItem = lazy(() => import("./Profile/sellingNFT"));

const GlobalStyles = createGlobalStyle`
    .mn-h-300px {
        min-height: 300px;
    }
`;

export default function SellingNFT() {

    const initialUser = useSelector(({ auth }) => auth.user);

    const [nfts, setNFTs] = useState([]);
    const [marketContract, setMarketContract] = useState({});
    const [restList, setRestList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(async() => {
        const { instanceMarketplace: Marketplace } = await getWeb3();
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
            <GlobalStyles/>
            <Suspense fallback={<Loading/>}>
                <InfiniteScroll
                    dataLength={nfts.length}
                    next={fetchNFT}
                    hasMore={restList.length ? true : false}
                    loader={<Loading/>}
                    className="row mn-h-300px"
                >
                    { nfts.map( (nft, index) => (
                        <NFTItem data={nft} key={index} Marketplace={marketContract}/>
                    ))}
                </InfiniteScroll>
                { loaded && !nfts.length && <Empty/>}
            </Suspense>
        </>
    )
}