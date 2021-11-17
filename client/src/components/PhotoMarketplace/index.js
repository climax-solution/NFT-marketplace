import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Loader, Button, Card, Input, Table, Form, Field, Image, is } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';
import { connect } from "react-redux";
import { SetStatus } from "../../store/action/wallet.actions";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { NotificationManager } from "react-notifications";


class PhotoMarketplace extends Component {
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
          allPhotos: [],
        };

        //this.handlePhotoNFTAddress = this.handlePhotoNFTAddress.bind(this);

        this.buyPhotoNFT = this.buyPhotoNFT.bind(this);
        this.addReputation = this.addReputation.bind(this);
    }

    ///--------------------------
    /// Handler
    ///-------------------------- 
    // handlePhotoNFTAddress(event) {
    //     this.setState({ valuePhotoNFTAddress: event.target.value });
    // }


    ///---------------------------------
    /// Functions of buying a photo NFT 
    ///---------------------------------
    buyPhotoNFT = async (id) => {
        const { web3, accounts, photoNFTMarketplace, photoNFTData, isMetaMask } = this.state;
        //const { web3, accounts, photoNFTMarketplace, photoNFTData, valuePhotoNFTAddress } = this.state;
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning");
          return;
        }
        // console.log('=== value of buyPhotoNFT ===', e.target.value);

        const PHOTO_NFT = id;
        //const PHOTO_NFT = valuePhotoNFTAddress;
        //this.setState({ valuePhotoNFTAddress: "" });

        /// Get instance by using created photoNFT address
        let PhotoNFT = {};
        // PhotoNFT = require("../../abi/PhotoNFT.json"); 
        // let photoNFT = new web3.eth.Contract(PhotoNFT, PHOTO_NFT);

        // /// Check owner of photoId
        // const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        // const owner = await photoNFT.methods.ownerOf(photoId).call();
        // console.log('=== owner of photoId ===', owner);  /// [Expect]: Owner should be the PhotoNFTMarketplace.sol (This also called as a proxy/escrow contract)

        const photo = await photoNFTData.methods.getPhotoByNFTAddress(PHOTO_NFT).call();
        const buyAmount = await photo.photoPrice;
        const txReceipt1 = await photoNFTMarketplace.methods.buyPhotoNFT(PHOTO_NFT).send({ from: accounts[0], value: buyAmount });
        this.getAllPhotos();
        console.log('=== response of buyPhotoNFT ===', txReceipt1);
    }


    ///--------------------------
    /// Functions of reputation 
    ///---------------------------
    addReputation = async () => {
        const { accounts, photoNFTMarketplace } = this.state;

        let _from2 = "0x2cb2418B11B66E331fFaC7FFB0463d91ef8FE8F5"
        let _to2 = accounts[0]
        let _tokenId2 = 1
        const response_1 = await photoNFTMarketplace.methods.reputation(_from2, _to2, _tokenId2).send({ from: accounts[0] })
        console.log('=== response of reputation function ===', response_1);      // Debug

        const response_2 = await photoNFTMarketplace.methods.getReputationCount(_tokenId2).call()
        console.log('=== response of getReputationCount function ===', response_2);      // Debug
    }


    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllPhotos = async () => {
        const { photoNFTData, currentAccount, isMetaMask } = this.state

        const allPhotos = await photoNFTData.methods.getAllPhotos().call()
        // console.log('list',list);
        this.setState({ allPhotos: allPhotos });
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
          PhotoNFTMarketplace = require("../../abi/PhotoNFTMarketplace.json");
          PhotoNFTData = require("../../abi/PhotoNFTData.json");
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

            let instancePhotoNFTMarketplace = null;
            let instancePhotoNFTData = null;
            let deployedNetwork = null;

            // Create instance of contracts
            if (PhotoNFTMarketplace.networks) {
              // - deployedNetwork = PhotoNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTMarketplace = new web3.eth.Contract(
                  PhotoNFTMarketplace,
                  process.env.REACT_APP_PHOTO_MARKETPLACE_ADDRESS,
                );
                console.log('=== instancePhotoNFTMarketplace ===', instancePhotoNFTMarketplace);
              }
            }

            if (PhotoNFTData.networks) {
              // - deployedNetwork = PhotoNFTData.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTData = new web3.eth.Contract(
                  PhotoNFTData,
                  process.env.REACT_APP_PHOTO_NFTDATA_ADDRESS,
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
                    currentAccount: currentAccount, 
                    photoNFTMarketplace: instancePhotoNFTMarketplace,
                    photoNFTData: instancePhotoNFTData }, () => {
                      this.refreshValues(instancePhotoNFTMarketplace);
                      setInterval(() => {
                        this.refreshValues(instancePhotoNFTMarketplace);
                    }, 5000);
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
                hotLoaderDisabled,
              });
            }

            ///@dev - NFT（Always load listed NFT data
            const allPhotos = await this.getAllPhotos();
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

    async componentDidUpdate(preprops) {
      const { web3 } = this.state;
      if (preprops != this.props) {
        const { connected } = this.props;
        this.setState({
          isMetaMask: connected
        })
        if (web3 != null) {
          const accounts = await web3.eth.getAccounts();
          this.setState({
            currentAccount: accounts[0]
          })
          await this.getAllPhotos();
        }
      }
    }

    refreshValues = (instancePhotoNFTMarketplace) => {
        if (instancePhotoNFTMarketplace) {
          console.log('refreshValues of instancePhotoNFTMarketplace');
        }
    }

    render() {
        const { web3, allPhotos, currentAccount, isMetaMask } = this.state;
        let premiumNFT, normalNFT;
        let isExist = true;
        if (isMetaMask) {
          premiumNFT = allPhotos.filter(item => item.premiumStatus && item.ownerAddress != currentAccount);
          normalNFT = allPhotos.filter(item => !item.premiumStatus&& item.ownerAddress != currentAccount);
          if (premiumNFT.length + normalNFT.length == 0) isExist = false;
        }
        else {
          premiumNFT = allPhotos.filter(item => item.premiumStatus );
          normalNFT = allPhotos.filter(item => !item.premiumStatus);
          if (premiumNFT.length + normalNFT.length == 0) isExist = false;
        }
        return (
          <>
          <Breadcrumb title="MARKETPLACE"/>
          <div className="row items" style={{minHeight: '300px'}}>
              {premiumNFT.map((item, idx) => {
                  if (isMetaMask && currentAccount == item.ownerAddress || !item.premiumStatus) return <></>;
                  else {
                      let ItemPrice = web3.utils.fromWei(`${item.photoPrice}`,"ether");
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
                                      <img className="card-img-top" src={`${process.env.REACT_APP_IPFS}/ipfs/${item.ipfsHashOfPhoto}`} alt="" />
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
                                              <span>{ItemPrice}</span>
                                          </div>
                                          <Button
                                              size={'medium'}
                                              width={1}
                                              onClick={() => this.buyPhotoNFT(item.photoNFT)}
                                              className="btn"
                                          > Buy </Button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  }
              })}
              {normalNFT.map((item, idx) => {
                  if (isMetaMask && currentAccount == item.ownerAddress || item.premiumStatus) return <></>;
                  else {
                      let ItemPrice = web3.utils.fromWei(`${item.photoPrice}`,"ether");
                      const pidx = ItemPrice.indexOf('.');
                      const pLen = ItemPrice.length;
                      if (pidx > 0) {
                        if (pLen - pidx > 3) {
                          ItemPrice = ItemPrice.substr(0, pidx + 4);
                        }
                      }
                      return (
                          <div className="col-12 col-sm-6 col-lg-3 item" key={`exo_${idx}`}>
                              <div className="card">
                                  <div className="image-over">
                                      <img className="card-img-top" src={`${process.env.REACT_APP_IPFS}/ipfs/${item.ipfsHashOfPhoto}`} alt="" />
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
                                              <span>{ItemPrice}</span>
                                          </div>
                                          <Button
                                              size={'medium'}
                                              width={1}
                                              onClick={() => this.buyPhotoNFT(item.photoNFT)}
                                              className="btn"
                                          > Buy </Button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  }
                  return <></>;
              })}
              {
                !isExist && <h3 className="text-center text-muted">No items.</h3>
              }
          </div>
      </>
        );
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(PhotoMarketplace);