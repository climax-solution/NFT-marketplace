import React, { useState, useEffect, lazy } from "react";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import getWeb3 from "../../../../utils/getWeb3";
import axios from "axios";

const Empty = lazy(() => import("../../Empty"));
const Item = lazy(() => import("./sellingNFTItem"));
const PremiumNFTLoading = lazy(() => import("../../Loading/PremiumNFTLoading"));


export default function SellingNFT() {

    const initialUser = useSelector(({ auth }) => auth.user);

    const [nfts, setNFTs] = useState([]);
    const [marketContract, setMarketContract] = useState({});
    const [restList, setRestList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(async() => {
        const { instanceMarketplace: Marketplace, instanceNFT } = await getWeb3();
        if (Marketplace) {
            setLoaded(false);
            setMarketContract(Marketplace);
            let _list = await instanceNFT.methods.getPersonalNFT(initialUser.walletAddress).call();
            let sellingList = [];
            _list = _list.filter(item => (item.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase());
            await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-sale-list`, { walletAddress: initialUser.walletAddress }).then(res => {
                const { list } = res.data;
                let keys = [];
                list.map(item => {
                    keys.push((item.tokenID).toString());
                });
                _list.map(item => {
                    const index = keys.indexOf(item.tokenID);
                    if (index > -1) {
                        sellingList.push({ ...item, ...list[index]});
                    }
                });
            }).catch(err => {

            });

            setRestList(sellingList);
            setNFTs([]);
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
        let _list = [...nfts];
        _list.splice(index, 1);
        setNFTs(_list);
    }
    
    return (
        <>
            <InfiniteScroll
                dataLength={nfts.length}
                next={fetchNFT}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="row overflow-unset"
            >
                { nfts.map( (nft, index) => (
                    <Item data={nft} key={index} Marketplace={marketContract} remove={() => removeItem(index)}/>
                ))}
            </InfiniteScroll>
            { !loaded ? <PremiumNFTLoading/> : (!nfts.length && <Empty/>) }
        </>
    )
}