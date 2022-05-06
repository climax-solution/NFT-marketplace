import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import getWeb3 from "../../../../utils/getWeb3";
import axios from "axios";

import Empty from "../../Empty";
import PremiumNFTLoading from "../../Loading/PremiumNFTLoading";
import Item from "./collectedNFTItem";

export default function CollectedNFT() {

    const initialUser = useSelector((state) => state.auth.user);

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
            let _list = await NFT.methods.getPersonalNFT(initialUser.walletAddress).call();
            _list = [..._list];
            // // _list = _list.filter(item => item.owner == initialUser.walletAddress);
            await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-sale-list`, { walletAddress: initialUser.walletAddress }).then(res => {
                const { list } = res.data;
                let keys = [];
                list.map(item => {
                    keys.push((item.tokenID).toString());
                });
                _list = _list.filter(item => (item.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase() && keys.indexOf(item.tokenID) < 0);
            }).catch(err => {

            });
            
            setRestList(_list);
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
        <div id='zero2' className='onStep fadeIn mn-h-300px'>
            {
                !loaded && <PremiumNFTLoading/>
            }
            <InfiniteScroll
                dataLength={nfts.length}
                next={fetchNFT}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="row overflow-unset"
            >
                {nfts.map( (nft, index) => (
                    <Item data={nft} key={index} remove={() => removeItem(index)} NFT={nftContract} Marketplace={marketContract}/>
                ))}
            </InfiniteScroll>

            { loaded && !nfts.length && <Empty/>}
        </div>
    )
}