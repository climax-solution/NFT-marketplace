import React, { Component } from 'react';
import getWeb3 from '../../utils/getWeb3';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import addresses from "../../config/address.json";

const { marketplace_addr, nft_addr, token_addr } = addresses;

class ItemDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
          web3: null,
          itemData: {}
        }
    }

    componentDidMount = async () => {
        const { id } = this.props.match.params;
        let PhotoNFT = {};
        let PhotoMarketplace = {};
        let COIN = [];
        try {
            PhotoNFT = require("../../../../build/contracts/PhotoNFT.json");
            PhotoMarketplace = require("../../../../build/contracts/PhotoMarketplace.json");
            COIN = require("../../../../build/contracts/MSDOGE.json");
            console.log(marketplace_addr, PhotoMarketplace);
        } catch (e) {
            //console.log(e);
        }
  
        try {
            const isProd = process.env.NODE_ENV === "production";
            if (!isProd) {
                const web3 = await getWeb3();
                const accounts = await web3.eth.getAccounts();
                const currentAccount = accounts[0];
  
                const networkType = await web3.eth.net.getNetworkType();
                let balance =
                    accounts.length > 0
                        ? await web3.eth.getBalance(accounts[0])
                        : web3.utils.toWei("0");
                balance = web3.utils.fromWei(balance, "ether");
  
                let instancePhotoNFT = null;
                let instancePhotoMarketplace = null;
                let instanceCoin = null;
  
                instanceCoin = new web3.eth.Contract(COIN, token_addr);
                if (PhotoNFT) {
                      instancePhotoNFT = new web3.eth.Contract(PhotoNFT, nft_addr);
                }
  
                if (PhotoMarketplace) {
                      instancePhotoMarketplace = new web3.eth.Contract(PhotoMarketplace, marketplace_addr);
                }
  
                if (instancePhotoNFT && instancePhotoMarketplace) {
                    // Set web3, accounts, and contract to the state, and then proceed with an
                    // example of interacting with the contract's methods.
                    this.setState(
                        {
                            web3,
                            accounts,
                            balance,
                            networkType,
                            PhotoNFT: instancePhotoNFT,
                            PhotoMarketplace: instancePhotoMarketplace,
                            currentAccount,
                            coin: instanceCoin
                        }
                    );
                } else {
                    this.setState({
                        web3,
                        accounts,
                        balance,
                        networkType,
                        currentAccount,
                        coin: instanceCoin
                    });
                }
                const item = await instancePhotoMarketplace.methods.getPhoto(id).call();
                const response = await fetch(`http://localhost:8080/ipfs/${item.nftData.tokenURI}`);
                const result = await response.json();
                this.setState({ itemData: { ...item, ...result }})
            }
            
        } catch (error) {
            console.error(error);
        }
      };

    render() {
        const { itemData, web3 } = this.state;
        return (
            <>
            <Breadcrumb title="NFT ITEM"/>
            {
            Object.keys(itemData).length ?
                <section className="item-details-area">
                    <div className="container">
                        <div className="row justify-content-between">
                            <div className="col-12 col-lg-5">
                                <div className="item-info">
                                    <div className="item-thumb text-center p-md-4 p-3" style={{background: "rgba(255,255,255,0.1)"}}>
                                        <img src={`${process.env.REACT_APP_IPFS}/ipfs/${itemData.image}`} alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6">
                                {/* Content */}
                                <div className="content mt-5 mt-lg-0">
                                    <h3 className="m-0">{itemData.nftName}</h3>
                                    {/* Owner */}
                                    <div className="owner d-flex align-items-center mt-4">
                                        <span>Owner : </span>
                                        <a href={`https://bscscan.com/address/${itemData.nftData.owner}`} target="_blank" className="ml-2">{itemData.nftData.owner.substr(0,14) + "..." + itemData.nftData.owner.substr(-4)}</a>
                                    </div>
                                    {/* Item Info List */}
                                    <div className="item-info-list mt-4">
                                        <ul className="list-unstyled">
                                            <li className="price d-flex justify-content-between">
                                                <span>Current Price :  {web3.utils.fromWei(`${itemData.marketData.price}`,"ether")} BNB</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="item-info-list mt-4">
                                        <ul className="list-unstyled">
                                            <li className="price d-flex justify-content-between">
                                                <span>Premium NFT :  {itemData.marketData.premiumStatus ? "YES" : "NO"}</span>
                                            </li>
                                        </ul>
                                    </div>  
                                    <p>Description:</p>
                                    <p>{itemData.nftDesc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                : <h3 className="text-muted ml-3">No existed item</h3>
            }
            </>
        );
    }
}

export default ItemDetails;