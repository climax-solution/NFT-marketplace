import React, { useState, useEffect, lazy } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import NotSaleNFT from "./notSellingNFTItem";
import getWeb3 from "../../../utils/getWeb3";

const Empty = lazy(() => import("../Empty"));
const PremiumNFTLoading = lazy(() => import("../Loading/PremiumNFTLoading"));

export default function NotSellingNFT() {

    const initUserData = useSelector((state) => state.auth.user);

    const [nftContract, setNFTContract] = useState({});
    const [marketContract, setMarketContract] = useState({});
    const [nfts, setNFTs] = useState([]);
    const [restList, setRestList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(async() => {
        const { instanceMarketplace: Marketplace, instanceNFT: NFT } = await getWeb3();
        if (Marketplace) {
            setNFTContract(NFT);
            setMarketContract(Marketplace);
            let list = await Marketplace.methods.getPersonalNFTList().call({ from: initUserData.walletAddress });
            list = list.filter(item => item.marketData.existance && !item.marketData.marketStatus);
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

    const removeItem = (index) => {
        const _list = [ ...nfts ];
        _list.splice(index, 1);
        setNFTs(_list);
    }

    return (
        <>
            <>
                <InfiniteScroll
                    dataLength={nfts.length}
                    next={fetchNFT}
                    hasMore={restList.length ? true : false}
                    loader={<PremiumNFTLoading/>}
                    className="row overflow-unset"
                >
                    {nfts.map( (nft, index) => (
                        <NotSaleNFT data={nft} key={index} remove={() => removeItem(index)} NFT={nftContract} Marketplace={marketContract}/>
                    ))}
                </InfiniteScroll>

                { loaded && !nfts.length && <Empty/>}
            </>
        </>
    )
}