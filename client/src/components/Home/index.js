import React, { Component } from "react";
import { connect } from "react-redux";
import getWeb3 from "../../utils/getWeb3";
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {  Button } from 'rimble-ui';
import { NotificationManager } from "react-notifications";

class Home extends Component {
    constructor(props) {    
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          currentAccount: null,          
          route: window.location.pathname.replace("/", ""),
          photoNFT : null, 

          /////// NFT
          allPhotos: [],
          loading: false,
          isConnected: false
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
      // //console.log('=== value of buyPhotoNFT ===', e.target.value);

      const PHOTO_NFT = id;

      const photo = await PhotoMarketplace.methods.getPhoto(PHOTO_NFT).call();
      const buyAmount = photo.marketData.price;
      const txReceipt1 = await PhotoMarketplace.methods.buyNFT(PHOTO_NFT).send({ from: accounts[0], value: buyAmount });
      await this.getAllPhotos();
      //console.log('=== response of buyPhotoNFT ===', txReceipt1);
    }
    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllPhotos = async () => {
      const {  PhotoMarketplace, currentAccount, isMetaMask } = this.state;
      const allPhotos = await PhotoMarketplace.methods.getAllPhotos().call();
      //console.log("=== allPhotos ===", allPhotos);
      let finalResult = await Promise.all(allPhotos.map(async (item) => {
          const response = await fetch(`http://localhost:8080/ipfs/${item.nftData.tokenURI}`);
          if(!response.ok)
              throw new Error(response.statusText);
          const json = await response.json();
          return {...item, ...json}
      }) );

      finalResult = finalResult.filter(item => item.marketData.premiumStatus && item.marketData.marketStatus );

      finalResult.sort((before, after) => {
        return before.marketData.premiumTimestamp - after.marketData.premiumTimestamp;
      })

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
                  }
              }

              if (PhotoMarketplace.networks) {
                  deployedNetwork = PhotoMarketplace.networks[networkId.toString()];
                  if (deployedNetwork) {
                      instancePhotoMarketplace = new web3.eth.Contract(
                          PhotoMarketplace.abi,
                          deployedNetwork && deployedNetwork.address
                      );
                      marketplaceAddress = deployedNetwork.address;
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
                          PhotoNFT: instancePhotoNFT,
                          PhotoMarketplace : instancePhotoMarketplace, 
                          currentAccount, 
                          marketplaceAddress
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
                      hotLoaderDisabled
                  });
              }
          }
      } catch (error) {
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

      if (web3 != prevState.web3) {
        if (web3 != null) {
          const accounts = await web3.eth.getAccounts();
          this.setState({
            currentAccount: this.props.connected ? accounts[0] : ''
          })
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
        let List = allPhotos.filter(item => item.nftData.owner != currentAccount || !isMetaMask);
        console.log(List);
        return(
            <>
                <Breadcrumb img="home"/>
                <div className="row mt-3">
                    <div className="col-12">
                        {/* Intro */}
                        <div className="intro d-flex justify-content-between align-items-end m-0">
                            <div className="intro-content">
                                <span><i className="icon-star"></i> Premium NFTs</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row items" style={{minHeight: '300px'}}>
                    {
                      List.map((item, idx) => {
                          return (
                            <div className="col-12 col-sm-6 col-lg-3 item" key={idx}>
                                  <div className="card">
                                      <div className="image-over">
                                          <a href={`/item-details/${item.nftData.tokenID}`}><img className="card-img-top" src={`${process.env.REACT_APP_IPFS}/ipfs/${item.image}`} alt="" /></a>
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
                                                  <span>{web3.utils.fromWei(item.marketData.price)}</span>
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
                          )
                      })
                    }
                    {
                      !List.length && <h3 className="text-center text-muted">No items.</h3>
                    }
                </div>
            </>
        )
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(Home);