import React, { Component } from 'react';
import getWeb3 from '../../utils/getWeb3';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

const initData = {
    itemImg: "/img/auction_2.jpg",
    date: "2022-03-30",
    tab_1: "Bids",
    tab_2: "History",
    tab_3: "Details",
    ownerImg: "/img/avatar_1.jpg",
    itemOwner: "Themeland",
    created: "15 Jul 2021",
    title: "Walking On Air",
    content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum obcaecati dignissimos quae quo ad iste ipsum officiis deleniti asperiores sit.",
    price_1: "1.5 ETH",
    price_2: "$500.89",
    count: "1 of 5",
    size: "14000 x 14000 px",
    volume: "64.1",
    highest_bid: "2.9 BNB",
    bid_count: "1 of 5",
    btnText: "Place a Bid"
}

const tabData_1 = [
    {
        id: "1",
        img: "/img/avatar_1.jpg",
        price: "14 ETH",
        time: "4 hours ago",
        author: "@arham"
    },
    {
        id: "2",
        img: "/img/avatar_2.jpg",
        price: "10 ETH",
        time: "8 hours ago",
        author: "@junaid"
    },
    {
        id: "3",
        img: "/img/avatar_3.jpg",
        price: "12 ETH",
        time: "3 hours ago",
        author: "@yasmin"
    }
]

const tabData_2 = [
    {
        id: "1",
        img: "/img/avatar_6.jpg",
        price: "32 ETH",
        time: "10 hours ago",
        author: "@hasan"
    },
    {
        id: "2",
        img: "/img/avatar_7.jpg",
        price: "24 ETH",
        time: "6 hours ago",
        author: "@artnox"
    },
    {
        id: "3",
        img: "/img/avatar_8.jpg",
        price: "29 ETH",
        time: "12 hours ago",
        author: "@meez"
    }
]

const sellerData = [
    {
        id: "1",
        img: "/img/avatar_1.jpg",
        seller: "@ArtNoxStudio",
        post: "Creator"
    },
    {
        id: "2",
        img: "/img/avatar_2.jpg",
        seller: "Virtual Worlds",
        post: "Collection"
    }
]

class ItemDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
          web3: null,
          itemData: []
        }
    }

    async componentDidMount(){
        const { address } = this.props.match.params;
        const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
     
        let PhotoNFTMarketplace = {};
        let PhotoNFTData = {};
        try {
          PhotoNFTData = require("../../../../build/contracts/PhotoNFTData.json");
        } catch (e) {
          console.log(e);
        }

        try {
          const isProd = process.env.NODE_ENV === 'production';
          if (!isProd) {
            // Get network provider and web3 instance.
            const web3 = await getWeb3("load");
            let ganacheAccounts = [];

            try {
              ganacheAccounts = await this.getGanacheAddresses();
            } catch (e) {
              console.log('Ganache is not running');
            }

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            const currentAccount = accounts[0];

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const networkType = await web3.eth.net.getNetworkType();
            //this.props.setConnection(isMetaMask);
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instancePhotoNFTData = null;
            let deployedNetwork = null;

            if (PhotoNFTData.networks) {
              deployedNetwork = PhotoNFTData.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTData = new web3.eth.Contract(
                  PhotoNFTData.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instancePhotoNFTData ===', instancePhotoNFTData);
              }
            }

            if (instancePhotoNFTData) {
                // Set web3, accounts, and contract to the state, and then proceed with an
                // example of interacting with the contract's methods.
                this.setState({ 
                    web3, 
                    ganacheAccounts, 
                    accounts, 
                    balance, 
                    networkId, 
                    networkType, 
                    hotLoaderDisabled,
                    currentAccount: currentAccount,
                    photoNFTData: instancePhotoNFTData,
                });
            }
            else {
              this.setState({
                web3,
                ganacheAccounts,
                accounts,
                balance,
                networkId,
                networkType,
                hotLoaderDisabled
              });
            }

            ///@dev - NFT（Always load listed NFT data
            const { photoNFTData } = this.state;
            const ItemData = await photoNFTData.methods.getPhotoByNFTAddress(address).call();
            this.setState({
                itemData: ItemData
            })

          }
        } catch (error) {
          // Catch any errors for any of the above operations.
          // alert(
          //   `Failed to load web3, accounts, or contract. Check console for details.`,
          // );
          // console.error(error);
        }
    }
    render() {
        const { itemData, web3 } = this.state;
        return (
            <>
            <Breadcrumb title="NFT ITEM"/>
            {itemData.length ?
                <section className="item-details-area">
                    <div className="container">
                        <div className="row justify-content-between">
                            <div className="col-12 col-lg-5">
                                <div className="item-info">
                                    <div className="item-thumb text-center p-md-4 p-3" style={{background: "rgba(255,255,255,0.1)"}}>
                                        <img src={`${process.env.REACT_APP_IPFS}/ipfs/${itemData.ipfsHashOfPhoto}`} alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6">
                                {/* Content */}
                                <div className="content mt-5 mt-lg-0">
                                    <h3 className="m-0">{itemData.photoNFTName}</h3>
                                    {/* Owner */}
                                    <div className="owner d-flex align-items-center">
                                        <span>Owner </span>
                                        <a className="owner-meta d-flex align-items-center ml-3" href="/author">
                                            {/* <img className="avatar-sm rounded-circle" src={itemData.ownerImg} alt="" /> */}
                                            <h6 className="ml-2">{itemData.ownerAddress.substr(0,14) + "..." + itemData.ownerAddress.substr(-4)}</h6>
                                        </a>
                                    </div>
                                    <div className="owner d-flex align-items-center">
                                        <span>Contract </span>
                                        <a className="owner-meta d-flex align-items-center ml-3" href="/author">
                                            {/* <img className="avatar-sm rounded-circle" src={itemData.ownerImg} alt="" /> */}
                                            <h6 className="ml-2">{itemData.photoNFT.substr(0,14) + "..." + itemData.photoNFT.substr(-4)}</h6>
                                        </a>
                                    </div>
                                    {/* Item Info List */}
                                    <div className="item-info-list mt-4">
                                        <ul className="list-unstyled">
                                            <li className="price d-flex justify-content-between">
                                                <span>Current Price {web3.utils.fromWei(`${itemData.photoPrice}`,"ether")}</span>
                                                {/* <span>{itemData.price_2}</span>
                                                <span>{itemData.count}</span> */}
                                            </li>
                                        </ul>
                                    </div>
                                    <p>Description:</p>
                                    <p>{itemData.photoNFTDesc}</p>
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