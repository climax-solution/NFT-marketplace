import React, { useState, useEffect } from "react";
import { createGlobalStyle } from "styled-components";
import Empty from "./Empty";

const GlobalStyles = createGlobalStyle`
    .trade-btn-group {
        span {
            padding: 2px 10px;
        }
    }
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

    // const putOnSale = async (id) => {
    //     const photoPrice = web3.utils.toWei((result.value).toString(), 'ether');
    //     await PhotoNFT.methods.approve(marketplace_addr, id).send({from : accounts[0]})
    //     .on('receipt', async(rec) => {
    //     await PhotoMarketplace.methods.openTrade(id).send({ from: accounts[0], value: photoPrice / 40 });
    //     this.setState({
    //         isLoading: false
    //     })
    // }
  
    // const cancelOnSale = async (id) => {
    //     const { coin, accounts, PhotoMarketplace } = this.state;
    //     this.setState({
    //     isLoading: true
    //     })
    //     try {
    //     const photo = await PhotoMarketplace.methods.getPhoto(id).call();
    //     const buyAmount = photo.marketData.price;
    //     // await coin.methods.approve(marketplace_addr, buyAmount).send({ from: accounts[0] });
    //     await PhotoMarketplace.methods.cancelTrade(id).send({ from: accounts[0], value: buyAmount / 40 }).
    //     then(async(result) => {
    //         this.setState({
    //         isLoading: false
    //         })
    //         NotificationManager.success("Success");
    //         await this.getAllPhotos();
    //     });
    //     } catch(err) {
    //     NotificationManager.error("Failed");
    //     this.setState({
    //         isLoading: false
    //     })
    //     }
    // }
  
    // const putOnPremium = async (id) => {
    //     const { accounts, PhotoMarketplace, PhotoNFT, currentAccount } = this.state;
    //     this.setState({
    //     isLoading: true
    //     })
    //     try {
    //     const owner = await PhotoNFT.methods.ownerOf(id).call();
    //     if (owner.toLowerCase() != currentAccount.toLowerCase() && currentAccount) throw "Not owner";
    //     const photo = await PhotoMarketplace.methods.getPhoto(id).call();
    //     const tax = photo.marketData.price;
    //     await PhotoMarketplace.methods.updatePremiumStatus(id, true).send({ from: accounts[0], value: tax / 20});
    //     this.setState({
    //         isLoading: false
    //     })
    //     NotificationManager.success("Success");
    //     await this.getAllPhotos();
    //     } catch(err) {
    //     if (typeof err == "string") NotificationManager.error(err);
    //     else NotificationManager.error("Failed");
    //     this.setState({
    //         isLoading: false
    //     })
    //     }
    // }
  
    // const putOnNormal = async (id) => {
    //     const { accounts, PhotoMarketplace, coin } = this.state;
    //     this.setState({
    //     isLoading: true
    //     })
    //     try {
    //     const photo = await PhotoMarketplace.methods.getPhoto(id).call();
    //     const tax = photo.marketData.price;
    //     await PhotoMarketplace.methods.updatePremiumStatus(id, false).send({ from: accounts[0], value: tax / 20});
    //     this.setState({
    //         isLoading: false
    //     })
    //     NotificationManager.success("Success");
    //     await this.getAllPhotos();
    //     } catch(err) {
    //     NotificationManager.error("Failed");
    //     this.setState({
    //         isLoading: false
    //     })
    //     }
    // }
    console.log(nfts);
    return (
        <div className='row'>
            <GlobalStyles/>
            { nfts.map( (nft, index) => (
                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12">
                    <div className="nft__item">
                        <div className="nft__item_wrap">
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
                            <div className="pb-4 trade-btn-group">
                                { !nft.marketData.marketStatus ? <span className="btn-main w-100">Put on sale</span> : <span className="btn-main w-100">Put down sale</span> }
                                { !nft.marketData.premiumStatus ? <span className="btn-main mt-2 w-100">To Preimum</span> : <span className="btn-main mt-2 w-100">To Normal</span> }
                            </div>
                        </div> 
                    </div>
                </div>  
            ))}

            {!nfts.length && <Empty/>}
            
        </div>
    )
}