import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Button, Card, Input, Table, Form, Field, Image } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import { SetStatus } from "../../store/action/wallet.actions";
import { connect } from "react-redux";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import "./products.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

class MyPhotos extends Component {
    constructor(props) {    
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          currentAccount: null,
          route: window.location.pathname.replace("/", ""),

          /////// NFT
          assets: [],
          isMetaMask: undefined
        };

        //this.handlePhotoNFTAddress = this.handlePhotoNFTAddress.bind(this);

        this.putOnSale = this.putOnSale.bind(this);
        this.cancelOnSale = this.cancelOnSale.bind(this);
    }

    ///--------------------------
    /// Handler
    ///-------------------------- 
    // handlePhotoNFTAddress(event) {
    //     this.setState({ valuePhotoNFTAddress: event.target.value });
    // }


    ///---------------------------------------------------------
    /// Functions put a photo NFT on sale or cancel it on sale 
    ///---------------------------------------------------------
    putOnSale = async (id) => {
        const { web3, accounts, photoNFTMarketplace, photoNFTData, PHOTO_NFT_MARKETPLACE } = this.state;

        console.log('=== value of putOnSale ===', id);
        console.log('=== PHOTO_NFT_MARKETPLACE ===', PHOTO_NFT_MARKETPLACE);

        const PHOTO_NFT = id;

        /// Get instance by using created photoNFT address
        let PhotoNFT = {};
        PhotoNFT = require("../../contracts/PhotoNFT.json"); 
        let photoNFT = new web3.eth.Contract(PhotoNFT.abi, PHOTO_NFT);

        /// Check owner of photoId
        const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        const owner = await photoNFT.methods.ownerOf(photoId).call();
        console.log('=== owner of photoId ===', owner);  /// [Expect]: Owner should be the PhotoNFTMarketplace.sol (This also called as a proxy/escrow contract)
            
        /// Put on sale (by a seller who is also called as owner)
        const txReceipt1 = await photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] });
        const xx = 'xx';
        const txReceipt2 = await photoNFTMarketplace.methods.openTrade(PHOTO_NFT, photoId).send({ from: accounts[0] });
        console.log('=== response of openTrade ===', txReceipt2);
    }

    cancelOnSale = async (id) => {
        const { web3, accounts, photoNFTMarketplace, photoNFTData, PHOTO_NFT_MARKETPLACE } = this.state;

        console.log('=== value of cancelOnSale ===', id);

        const PHOTO_NFT = id;

        /// Get instance by using created photoNFT address
        let PhotoNFT = {};
        PhotoNFT = require("../../contracts/PhotoNFT.json"); 
        let photoNFT = new web3.eth.Contract(PhotoNFT.abi, PHOTO_NFT);

        /// Check owner of photoId
        const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        const owner = await photoNFT.methods.ownerOf(photoId).call();
        console.log('=== owner of photoId ===', owner);  /// [Expect]: Owner should be the PhotoNFTMarketplace.sol (This also called as a proxy/escrow contract)
            
        /// Cancel on sale
        //const txReceipt1 = await photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] });
        const txReceipt2 = await photoNFTMarketplace.methods.cancelTrade(PHOTO_NFT, photoId).send({ from: accounts[0] });
        console.log('=== response of cancelTrade ===', txReceipt2);
    }

    putOnPremium = async (id) => {
        const { web3, accounts, photoNFTMarketplace, photoNFTData, PHOTO_NFT_MARKETPLACE } = this.state;

        console.log('=== value of cancelOnSale ===', id);

        const PHOTO_NFT = id;

        /// Get instance by using created photoNFT address
        let PhotoNFT = {};
        PhotoNFT = require("../../contracts/PhotoNFT.json"); 
        let photoNFT = new web3.eth.Contract(PhotoNFT.abi, PHOTO_NFT);

        /// Check owner of photoId
        const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        
        /// putOnPremium
        //const txReceipt1 = await photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] });
        const txReceipt2 = await photoNFTMarketplace.methods.updatePremiumStatus(PHOTO_NFT, photoId, true).send({ from: accounts[0] });
        console.log('=== response of putOnPremium ===', txReceipt2);
        await this.getAllPhotos();
    }

    putOnNormal = async (id) => {
        const { web3, accounts, photoNFTMarketplace, photoNFTData, PHOTO_NFT_MARKETPLACE } = this.state;

        console.log('=== value of cancelOnSale ===', id);

        const PHOTO_NFT = id;

        /// Get instance by using created photoNFT address
        let PhotoNFT = {};
        PhotoNFT = require("../../contracts/PhotoNFT.json"); 
        let photoNFT = new web3.eth.Contract(PhotoNFT.abi, PHOTO_NFT);

        /// Check owner of photoId
        const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        
        /// putOnPremium
        //const txReceipt1 = await photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] });
        const txReceipt2 = await photoNFTMarketplace.methods.updatePremiumStatus(PHOTO_NFT, photoId, false).send({ from: accounts[0] });
        console.log('=== response of putOnNormal ===', txReceipt2);
        await this.getAllPhotos();
    }

    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllPhotos = async () => {
        const { photoNFTData } = this.state

        const allPhotos = await photoNFTData.methods.getAllPhotos().call()
        console.log('=== allPhotos ===', allPhotos)

        this.setState({ allPhotos: allPhotos })
        return allPhotos
    }


    //////////////////////////////////// 
    /// Ganache
    ////////////////////////////////////
    getGanacheAddresses = async () => {
        if (!this.ganacheProvider) {
          this.ganacheProvider = getGanacheWeb3();
        }
        if (this.ganacheProvider) {
          return await this.ganacheProvider.eth.getAccounts();
        }
        return [];
    }

    componentDidMount = async () => {
        const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
     
        let PhotoNFTMarketplace = {};
        let PhotoNFTData = {};
        try {
          PhotoNFTMarketplace = require("../../contracts/PhotoNFTMarketplace.json");
          PhotoNFTData = require("../../contracts/PhotoNFTData.json");
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
            const isMetaMask = web3.currentProvider.isMetaMask;
            this.props.setConnection(isMetaMask);
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instancePhotoNFTMarketplace = null;
            let instancePhotoNFTData = null;
            let PHOTO_NFT_MARKETPLACE;
            let deployedNetwork = null;

            // Create instance of contracts
            if (PhotoNFTMarketplace.networks) {
              deployedNetwork = PhotoNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTMarketplace = new web3.eth.Contract(
                  PhotoNFTMarketplace.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                PHOTO_NFT_MARKETPLACE = deployedNetwork.address;
                console.log('=== instancePhotoNFTMarketplace ===', instancePhotoNFTMarketplace);
              }
            }

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

            if (instancePhotoNFTMarketplace) {
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
                    isMetaMask, 
                    currentAccount: currentAccount,
                    photoNFTMarketplace: instancePhotoNFTMarketplace,
                    photoNFTData: instancePhotoNFTData,
                    PHOTO_NFT_MARKETPLACE: PHOTO_NFT_MARKETPLACE }, () => {
                      this.refreshValues(instancePhotoNFTMarketplace);
                      setInterval(() => {
                        this.refreshValues(instancePhotoNFTMarketplace);
                    }, 5000);
                });
            }
            else {
              this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
            }

            ///@dev - NFT（Always load listed NFT data
            const allPhotos = await this.getAllPhotos();
            this.checkAssets(allPhotos);
          }
        } catch (error) {
          // Catch any errors for any of the above operations.
          // alert(
          //   `Failed to load web3, accounts, or contract. Check console for details.`,
          // );
          // console.error(error);
        }
    };

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    refreshValues = (instancePhotoNFTMarketplace) => {
        if (instancePhotoNFTMarketplace) {
          console.log('refreshValues of instancePhotoNFTMarketplace');
        }
    }

    checkAssets(allPhotos) {
      const { currentAccount } = this.state;
      const list = allPhotos.filter(item => currentAccount == item.ownerAddress);
      this.setState({
          assets: list
      })
    }
    render() {
        const { web3, assets, currentAccount, isMetaMask } = this.state;
        console.log(assets);
        return (
          <>
            <Breadcrumb title="ASSETS"/>
            {
                !isMetaMask == undefined ?
                <Loader
                    type="ThreeDots"
                    color="#00BFFF"
                    height={100}
                    width={100}
                    className="text-center"
                />:
                <div className="row items" style={{padding: '30px 0'}}>
                    {assets.map((item, idx) => {
                        if (currentAccount == item.ownerAddress) {
                            return (
                                <div className="col-12 col-sm-6 col-lg-3 item" key={idx}>
                                    <div className="card" key={`exo_${idx}`}>
                                        <div className="image-over">
                                            <img className="card-img-top" src={`https://ipfs.io/${item.ipfsHashOfPhoto}`} alt="" />
                                        </div>
                                        {/* Card Caption */}
                                        <div className="card-caption col-12 p-0">
                                            {/* Card Body */}
                                            <div className="card-body">
                                                <div className="card-bottom d-flex justify-content-between">
                                                    <span>Token Name</span>
                                                    <span>Price</span>
                                                </div>
                                                <div className="card-bottom d-flex justify-content-between">
                                                    <span>{item.photoNFTName}</span>
                                                    <span>{web3.utils.fromWei(
                                                        `${item.photoPrice}`,
                                                        "ether"
                                                    )}</span>
                                                </div>
                                                { item.status == "Cancelled" ? 
                                                    <Button
                                                      size={'medium'}
                                                      width={1}
                                                      className="btn"
                                                      onClick={() => this.putOnSale(item.photoNFT)}
                                                    > Put on sale </Button>
                                                :
                                                    <Button
                                                      size={'medium'}
                                                      width={1}
                                                      className="btn"
                                                      onClick={() => this.cancelOnSale(item.photoNFT)}
                                                    > Cancel on sale </Button>
                                                }
                                                  <div style={{ padding: "5px" }}></div>

                                                  {/* premium */}
                                                  {
                                                      item.premiumStatus ? 
                                                      <Button
                                                        size={'medium'}
                                                        width={1}
                                                        className="btn"
                                                        onClick={() => this.putOnNormal(item.photoNFT)}
                                                      >Make it normal </Button>
                                                      :
                                                      <Button
                                                        size={'medium'}
                                                        width={1}
                                                        className="btn"
                                                        onClick={() => this.putOnPremium(item.photoNFT)}
                                                      >Make it premium</Button>
                                                  }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        else return <></>;
                    })}
                    {
                        !assets.length && <h2 className="text-center text-muted">No items.</h2>
                    }
                </div>
            }
          </>
        );
    }
}
const mapDispatchToProps = dispatch => ({
  setConnection: (status) => dispatch(SetStatus(status))
})
export default connect(null, mapDispatchToProps)(MyPhotos);

