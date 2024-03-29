import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import getWeb3 from "../../../../utils/getWeb3";
import axios from "axios";

import Empty from "../../Empty";
import Item from "./sellingNFTItem";
import PremiumNFTLoading from "../../Loading/PremiumNFTLoading";


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
        if (tmpList.length > 48) {
          tmpList = tmpList.slice(0, 48);
          setRestList(restList.slice(48, restList.length));
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
        <div id='zero1' className='onStep fadeIn mn-h-300px'>
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
        </div>
    )
}