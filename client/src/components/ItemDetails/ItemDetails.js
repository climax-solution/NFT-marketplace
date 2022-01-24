import React, { Component } from 'react';
import getWeb3 from '../../utils/getWeb3';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import addresses from "../../config/address.json";
import ItemLoading  from "../Loading/itemLoading";

const { marketplace_addr, nft_addr } = addresses;

class ItemDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
          web3: null,
          itemData: {},
          isLoading: true,
          accounts: null,
          PhotoMarketplace: {},
          PhotoNFT: {},
        }
    }

    componentDidMount = async () => {
        const { id } = this.props.match.params;
        let PhotoNFT = {};
        let PhotoMarketplace = {};
        try {
            PhotoNFT = require("../../abi/PhotoNFT.json");
            PhotoMarketplace = require("../../abi/PhotoMarketplace.json");
        } catch (e) {}
  
        try {
            
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const currentAccount = accounts[0];

            const networkType = await web3.eth.net.getNetworkType();
            let instancePhotoNFT = null;
            let instancePhotoMarketplace = null;
            
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
                        networkType,
                        PhotoNFT: instancePhotoNFT,
                        PhotoMarketplace: instancePhotoMarketplace,
                        currentAccount,
                    }
                );
            } else {
                this.setState({
                    web3,
                    accounts,
                    networkType,
                    currentAccount,
                });
            }
            const item = await instancePhotoMarketplace.methods.getPhoto(id).call();
            // console.log(item);
            const response = await fetch(`${item.nftData.tokenURI}`);
            const result = await response.json();
            this.setState({ itemData: { ...item, ...result }})
            
        } catch (error) {
            if (error) {
                console.log(error);
                this.setState({
                  itemLoading: false
                })
            }
        }
        this.setState({ isLoading: false });
    };

    faliedLoadImage = (e) => {
        e.target.src="/img/empty.png";
    }

    render() {
        const { itemData, web3, isLoading } = this.state;
        return (
            <>
            <Breadcrumb title="NFT ITEM"/>
            { isLoading  && <ItemLoading/> }
            {
                !isLoading && (
                Object.keys(itemData).length ?
                    <section className="item-details-area">
                        <div className="container">
                            <div className="row justify-content-between">
                                <div className="col-12 col-lg-5">
                                    <div className="item-info">
                                        <div className="item-thumb text-center p-md-4 p-3" style={{background: "rgba(255,255,255,0.1)"}}>
                                            <img src={`${itemData.image}`}  onError={this.faliedLoadImage} alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-6">
                                    {/* Content */}
                                    <div className="content mt-5 mt-lg-0">
                                        <h3 className="m-0">{itemData.nftName || itemData.nftname}</h3>
                                        {/* Owner */}
                                        <div className="owner d-flex align-items-center mt-3">
                                            <span>Owner : </span>
                                            <a href={`https://bscscan.com/address/${itemData.nftData.owner}`} target="_blank" rel="noopener noreferrer" className="ml-2">{itemData.nftData.owner.substr(0,14) + "..." + itemData.nftData.owner.substr(-4)}</a>
                                        </div>
                                        <div className="owner d-flex align-items-center mt-3">
                                            <span>Address : </span>
                                            <a href={`https://bscscan.com/token/${nft_addr}`} rel="noopener noreferrer" target="_blank" className="ml-2">{nft_addr}</a>
                                        </div>
                                        <div className="owner d-flex align-items-center mt-3">
                                            <span>Token ID :  {itemData.nftData.tokenID}</span>
                                        </div>
                                        {/* Item Info List */}
                                        <div className="item-info-list mt-3">
                                            <ul className="list-unstyled">
                                                <li className="price d-flex justify-content-between">
                                                    <span>Current Price :  {web3.utils.fromWei(`${itemData.marketData.price}`,"ether")} BNB</span>
                                                </li>
                                                <li className="price d-flex justify-content-between mt-3">
                                                    <span>Premium NFT :  {itemData.marketData.premiumStatus ? "YES" : "NO"}</span>
                                                </li>
                                                {
                                                    itemData.attributes && itemData.attributes.length &&
                                                    itemData.attributes.map(attrItem => {
                                                        return <li className="price d-flex justify-content-between mt-3">
                                                            <span>{attrItem.trait_type} :  {attrItem.value}</span>
                                                        </li>
                                                    })
                                                }
                                            </ul>
                                        </div>
                                        <div className="owner mt-3">
                                            <p>Description:</p>
                                            <p className='ml-md-5 ml-sm-0'>{itemData.nftDesc}</p>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    : <h3 className="text-muted ml-3">No existed item</h3>)
            }
            </>
        );
    }
}

export default ItemDetails;