import React, { useState, useEffect, lazy } from "react";
import { useSelector } from "react-redux";
import Select from 'react-select';
import InfiniteScroll from "react-infinite-scroll-component";
import getWeb3 from "../../../utils/getWeb3";

const Empty = lazy(() => import("../Empty"));
const NFTItem = lazy(() => import("./sellingNFTItem"));
const PremiumNFTLoading = lazy(() => import("../Loading/PremiumNFTLoading"));

const customStyles = {
    option: (base, state) => ({
      ...base,
      background: "#212428",
      color: "#fff",
      borderRadius: state.isFocused ? "0" : 0,
      "&:hover": {
        background: "#16181b",
      }
    }),
    menu: base => ({
      ...base,
      background: "#212428 !important",
      borderRadius: 0,
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      padding: 0
    }),
    control: (base, state) => ({
      ...base,
      padding: 2
    })
};

const categories = [
    { "value": 0, "label": "Normal NFTs" },
    { "value": 1, "label": "Premium NFTs"},
];

export default function SellingNFT() {

    const initialUser = useSelector(({ auth }) => auth.user);

    const [nfts, setNFTs] = useState([]);
    const [nftContract, setNFTContract] = useState({});
    const [marketContract, setMarketContract] = useState({});
    const [activeCategory, setCategory] = useState({ value: 0, label: "Normal NFTs" });
    const [restList, setRestList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(async() => {
        const { instanceMarketplace: Marketplace, instanceNFT } = await getWeb3();
        if (Marketplace) {
            setLoaded(false);
            let premium = false;
            if (activeCategory.value) premium = true;
            setNFTContract(instanceNFT);
            setMarketContract(Marketplace);
            let list = await Marketplace.methods.getPersonalNFTList().call({ from: initialUser.walletAddress });
            list = list.filter(item => item.marketData.existance && item.marketData.marketStatus && item.marketData.premiumStatus == premium);
            setNFTs([]);
            setRestList(list);
            setLoaded(true);
        }
    },[activeCategory, ])
  
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
            <Select
                className='select1 mx-auto me-0 mx-200px'
                styles={customStyles}
                menuContainerStyle={{'zIndex': 999}}
                value={activeCategory}
                options={categories}
                onChange={(value) => {
                    setCategory(value);
                }}
            />
            <InfiniteScroll
                dataLength={nfts.length}
                next={fetchNFT}
                hasMore={restList.length ? true : false}
                loader={<PremiumNFTLoading/>}
                className="row overflow-unset"
            >
                { nfts.map( (nft, index) => (
                    <NFTItem data={nft} key={index} remove={() => removeItem(index)} NFT={nftContract} Marketplace={marketContract}/>
                ))}
            </InfiniteScroll>
            { !loaded ? <PremiumNFTLoading/> : (!nfts.length && <Empty/>) }
        </>
    )
}