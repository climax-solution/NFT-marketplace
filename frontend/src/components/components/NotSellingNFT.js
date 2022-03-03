import React, { useState, useEffect, lazy, Suspense } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_LOADING_PROCESS } from "../../store/action/auth.action";
import NotSaleNFT from "./Profile/notSellingNFT";
import getWeb3 from "../../utils/getWeb3";

const Empty = lazy(() => import("./Empty"));
const Loading = lazy(() => import("./Loading/Loading"));

export default function NotSellingNFT(props) {

    const dispatch = useDispatch();
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
                    {nfts.map( (nft, index) => (
                        <NotSaleNFT data={nft} key={index} NFT={nftContract} Marketplace={marketContract}/>
                    ))}
                </InfiniteScroll>

                {!nfts.length && <Empty/>}
            </Suspense>
        </>
    )
}