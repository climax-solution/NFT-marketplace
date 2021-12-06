import React, { Component } from "react";
import { connect } from "react-redux";
import getWeb3 from "../../utils/getWeb3";
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {  Button } from 'rimble-ui';
import { NotificationManager } from "react-notifications";
import addresses from "../../config/address.json";

const { marketplace_addr, nft_addr, token_addr } = addresses;

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            accounts: null,
            currentAccount: null,
            allPhotos: [],
            coin: null,
            isLoading: false,
            isMetaMask: false,
            PhotoMarketplace: {},
            PhotoNFT: {}
        };

        this.buyPhotoNFT = this.buyPhotoNFT.bind(this);
    }
    
    buyPhotoNFT = async (id) => {
        const { accounts, PhotoMarketplace, isMetaMask, coin, marketplaceAddress } = this.state;
        
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning");
          return;
        }

        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const buyAmount = photo.marketData.price;

        await coin.methods.approve(marketplaceAddress, buyAmount).send({ from: accounts[0] });
        await PhotoMarketplace.methods.buyNFT(id, buyAmount).send({ from: accounts[0] });
        await this.getAllPhotos();
    }
    
    getAllPhotos = async () => {
      const {  PhotoMarketplace } = this.state;
      const allPhotos = await PhotoMarketplace.methods.getAllPhotos().call();
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
    
        let PhotoNFT = {};
        let PhotoMarketplace = {};
        let COIN = [];
        try {
            PhotoNFT = require("../../../../build/contracts/PhotoNFT.json");
            PhotoMarketplace = require("../../../../build/contracts/PhotoMarketplace.json");
            COIN = require("../../../../build/contracts/MSDOGE.json");
            console.log(PhotoNFT, PhotoMarketplace);
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
            }
            
            await this.getAllPhotos();
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
                      !List.length && <h4 className="text-center text-muted">No items.</h4>
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