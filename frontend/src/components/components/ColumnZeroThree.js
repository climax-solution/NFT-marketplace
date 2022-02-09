import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Empty from "./Empty";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;
export default function SellingNFT({data, _web3, ...props}) {

    const [web3, setWeb3] = useState({});
    const [Marketplace, setMarketplace] = useState({});
    const [NFT, setNFT] = useState({});
    const [nfts, setNFTs] = useState([]);
    const [restList, setRestList] = useState([]);
    const [height, setHeight] = useState(0);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(() => {
        const { _web3, data, _insNFT, _insMarketplace} = props;
        if (_insMarketplace) {
            setWeb3(_web3);
            setNFT(_insNFT);
            setRestList(data);
            setMarketplace(_insMarketplace);
            setLoaded(true);
        }
    },[props])

    useEffect(async() => {
        if (loaded) {
            await fetchNFT();
        }
    },[loaded])
    
    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    const fetchNFT = async() => {
        if (!restList.length) return;
        let tmpList = restList;
        if (tmpList.length > 8) {
          tmpList = tmpList.slice(0, 8);
          setRestList(restList.slice(8, restList.length));
        }
        else setRestList([]);
        let mainList = [];
        for await (let item of tmpList) {
          await axios.get(item.nftData.tokenURI).then(res => {
            mainList.push({...item, ...res.data});
          })
        }
    
        setNFTs([...nfts, ...mainList]);
    }

    return (
        <div className='row'>
            {nfts.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                    <div className="nft__item">
                        <div className="nft__item_wrap" style={{height: `${height}px`}}>
                        <Outer>
                            <span>
                                <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                            </span>
                        </Outer>
                        </div>
                        <div className="nft__item_info">
                            <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                <h4>{nft.nftName}</h4>
                            </span>
                            <div className="nft__item_price">
                                {web3.utils.fromWei(nft.marketData.price, "ether")} BNB
                            </div>
                            <div className="nft__item_like">
                                <i className="fa fa-heart"></i><span>{nft.likes}</span>
                            </div>
                        </div> 
                    </div>
                </div>  
            ))}

            {!nfts.length && <Empty/>}
            
        </div>
    )
}