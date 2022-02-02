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
    const [nfts, setNFTs] = useState([]);
    const [height, setHeight] = useState(0);

    const onImgLoad = ({target: img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(() => {
        if (_web3) {
            setWeb3(_web3);
            setNFTs(data);
        }
    },[data, _web3])

    return (
        <div className='row'>
            { nfts.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                    <div className="nft__item">
                        <div className="nft__item_wrap" style={{height: `${height}px`}}>
                            <a>
                                <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                            </a>
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