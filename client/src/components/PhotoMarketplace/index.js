import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Button} from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';
import { connect } from "react-redux";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { NotificationManager } from "react-notifications";

class PhotoMarketplace extends Component {
    constructor(props) {    
        super(props);
        this.state = {
          storageValue: 0,
          web3: null,
          accounts: null,
          currentAccount: null,          
          route: window.location.pathname.replace("/", ""),
          allPhotos: [],
        };

        this.buyPhotoNFT = this.buyPhotoNFT.bind(this);
    }

    ///---------------------------------
    /// Functions of buying a photo NFT 
    ///---------------------------------
    buyPhotoNFT = async (id) => {
        const { accounts, PhotoMarketplace, isMetaMask } = this.state;
        
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning");
          return;
        }
        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const buyAmount = photo.marketData.price;
        const txReceipt1 = await PhotoMarketplace.methods.buyNFT(id).send({ from: accounts[0], value: buyAmount });
        await this.getAllPhotos();
        //console.log('=== response of buyPhotoNFT ===', txReceipt1);
    }
    

    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    
    getAllPhotos = async () => {
      //console.log('1234567890')
      const { PhotoMarketplace } = this.state;
      //console.log("get All photo", PhotoNFT)

      const allPhotos = await PhotoMarketplace.methods.getAllPhotos().call();
      //console.log("=== allPhotos ===", allPhotos);
      const finalResult = await Promise.all(allPhotos.map(async (item) => {
          const response = await fetch(`http://localhost:8080/ipfs/${item.nftData.tokenURI}`);
          if(!response.ok)
              throw new Error(response.statusText);

          const json = await response.json();
          
          return {...item, ...json}
      }) );

      //console.log('async result', finalResult)
      this.setState({ allPhotos: finalResult });
    }

    componentDidMount = async () => {
      const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;

      let PhotoNFT = {};
      let PhotoMarketplace = {};
      try {
          PhotoNFT = require("../../../../build/contracts/PhotoNFT.json");
          PhotoMarketplace = require("../../../../build/contracts/PhotoMarketplace.json");
      } catch (e) {
          //console.log(e);
      }

      try {
          const isProd = process.env.NODE_ENV === "production";
          if (isProd) {
              // Get network provider and web3 instance.
              const web3 = await getWeb3();
              // Use web3 to get the user's accounts.
              const accounts = await web3.eth.getAccounts();
              const currentAccount = accounts[0];

              // Get the contract instance.
              const networkId = await web3.eth.net.getId();
              const networkType = await web3.eth.net.getNetworkType();
              const isMetaMask = web3.currentProvider.isMetaMask;
              let balance =
                  accounts.length > 0
                      ? await web3.eth.getBalance(accounts[0])
                      : web3.utils.toWei("0");
              balance = web3.utils.fromWei(balance, "ether");

              let instancePhotoNFT = null;
              let deployedNetwork = null;

              let instancePhotoMarketplace = null;

              let marketplaceAddress = null;

              // Create instance of contracts
              if (PhotoNFT.networks) {
                  deployedNetwork = PhotoNFT.networks[networkId.toString()];
                  if (deployedNetwork) {
                      instancePhotoNFT = new web3.eth.Contract(
                          PhotoNFT.abi,
                          deployedNetwork && deployedNetwork.address
                      );
                      marketplaceAddress = deployedNetwork.address;
                  }
              }

              if (PhotoMarketplace.networks) {
                  deployedNetwork =
                      PhotoMarketplace.networks[networkId.toString()];
                  if (deployedNetwork) {
                      instancePhotoMarketplace = new web3.eth.Contract(
                          PhotoMarketplace.abi,
                          deployedNetwork && deployedNetwork.address
                      );
                  }
              }

              if (instancePhotoNFT && instancePhotoMarketplace) {
                  // Set web3, accounts, and contract to the state, and then proceed with an
                  // example of interacting with the contract's methods.
                  this.setState(
                      {
                          web3,
                          accounts,
                          balance,
                          networkId,
                          networkType,
                          hotLoaderDisabled,
                          isMetaMask,
                          PhotoNFT: instancePhotoNFT,
                          PhotoMarketplace: instancePhotoMarketplace,
                          marketplaceAddress,
                          currentAccount
                      },
                      () => {
                          this.refreshValues(instancePhotoNFT);
                          setInterval(() => {
                              this.refreshValues(instancePhotoNFT);
                          }, 5000);
                      }
                  );
              } else {
                  this.setState({
                      web3,
                      accounts,
                      balance,
                      networkId,
                      networkType,
                      hotLoaderDisabled,
                      isMetaMask,
                      currentAccount
                  });
              }
          }
          ///@dev - NFT（Always load listed NFT data
          await this.getAllPhotos();
          // this.setState({ allPhotos: allPhotos })
      } catch (error) {
          console.error(error);
      }
    };

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    async componentDidUpdate(preprops, prevState) {
      const { web3 } = this.state;
      //console.log('truetrue', preprops != this.props, this.props.connected);

      if (preprops != this.props) {
        this.setState({
          isMetaMask: this.props.connected,
        })
        if (web3 != null) {
            await this.getAllPhotos();
        }
      }
    }

    refreshValues = (instancePhotoNFTMarketplace) => {
        if (instancePhotoNFTMarketplace) {
          //console.log('refreshValues of instancePhotoNFTMarketplace');
        }
    }

    render() {
        const { web3, allPhotos, currentAccount, isMetaMask } = this.state;
        console.log('allPhotos', allPhotos, isMetaMask);
        let premiumNFT, normalNFT;
        let isExist = true;
        if (isMetaMask) {
          premiumNFT = allPhotos.filter(item => item.marketData.premiumStatus && item.nftData.owner != currentAccount && item.marketData.marketStatus);
          normalNFT = allPhotos.filter(item => !item.marketData.premiumStatus && item.nftData.owner != currentAccount && item.marketData.marketStatus);
          if (premiumNFT.length + normalNFT.length == 0) isExist = false;
        }
        else {
          premiumNFT = allPhotos.filter(item => item.marketData.premiumStatus && item.marketData.marketStatus );
          normalNFT = allPhotos.filter(item => !item.marketData.premiumStatus && item.marketData.marketStatus);
          if (premiumNFT.length + normalNFT.length == 0) isExist = false;
        }
        return (
            <>
                <Breadcrumb img="marketplace"/>
                <div className="explore-area">
                    <div className="row justify-content-center text-center mt-3">
                        <div className="col-12">
                            {/* Explore Menu */}
                            <div className="explore-menu btn-group btn-group-toggle flex-wrap justify-content-center text-center mb-4" data-toggle="buttons">
                                <label className="btn active d-table text-uppercase p-2">
                                    <input type="radio" defaultValue="all" defaultChecked className="explore-btn" />
                                    <span>ALL</span>
                                </label>
                                <label className="btn d-table text-uppercase p-2">
                                    <input type="radio" defaultValue="art" className="explore-btn" />
                                    <span>ART</span>
                                </label>
                                <label className="btn d-table text-uppercase p-2">
                                    <input type="radio" defaultValue="music" className="explore-btn" />
                                    <span>MUSIC</span>
                                </label>
                                <label className="btn d-table text-uppercase p-2">
                                    <input type="radio" defaultValue="collectibles" className="explore-btn" />
                                    <span>COLLECTION</span>
                                </label>
                                <label className="btn d-table text-uppercase p-2">
                                    <input type="radio" defaultValue="sports" className="explore-btn" />
                                    <span>SPORTS</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row items" style={{minHeight: '300px'}}>
                        {premiumNFT.map((item, idx) => {
                            let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"ether");
                            const pidx = ItemPrice.indexOf('.');
                            const pLen = ItemPrice.length;
                            if (pidx > 0) {
                                if (pLen - pidx > 3) {
                                    ItemPrice = ItemPrice.substr(0, pidx + 4);
                                }
                            }
                            return (
                                <div className="col-12 col-sm-6 col-lg-3 item" key={idx} data-groups={item.category}>
                                    <div className="card">
                                        <div className="image-over">
                                            <img className="card-img-top" src={`${process.env.REACT_APP_IPFS}/ipfs/${item.image}`} alt="" />
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
                                                    <span>{item.nftName}</span>
                                                    <span>{ItemPrice}</span>
                                                </div>
                                                <Button
                                                    size={'medium'}
                                                    width={1}
                                                    onClick={() => this.buyPhotoNFT(item.nftData.tokenID)}
                                                    className="btn"
                                                > Buy </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {normalNFT.map((item, idx) => {
                            let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"ether");
                            const pidx = ItemPrice.indexOf('.');
                            const pLen = ItemPrice.length;
                            if (pidx > 0) {
                            if (pLen - pidx > 3) {
                                ItemPrice = ItemPrice.substr(0, pidx + 4);
                            }
                            }
                            return (
                                <div className="col-12 col-sm-6 col-lg-3 item" key={idx}>
                                    <div className="card">
                                        <div className="image-over">
                                            <img className="card-img-top" src={`${process.env.REACT_APP_IPFS}/ipfs/${item.image}`} alt="" />
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
                                                    <span>{item.nftName}</span>
                                                    <span>{ItemPrice}</span>
                                                </div>
                                                <Button
                                                    size={'medium'}
                                                    width={1}
                                                    onClick={() => this.buyPhotoNFT(item.nftData.tokenID)}
                                                    className="btn"
                                                > Buy </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {
                            !isExist && <h4 className="text-center text-muted">No items.</h4>
                        }
                    </div>
                </div>
                    
            </>
        );
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(PhotoMarketplace);