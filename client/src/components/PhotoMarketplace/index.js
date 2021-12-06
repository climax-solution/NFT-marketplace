import React, { Component } from "react";
import { Button} from 'rimble-ui';
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";
import styles from '../../App.module.scss';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Loading from "../Loading";

const marketplace_addr = process.env.REACT_APP_NFT_ADDR;
const nft_addr = process.env.REACT_APP_NFT_ADDR;
const token_addr = process.env.REACT_APP_TOKEN_ADDR;

class PhotoMarketplace extends Component {
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
        const { accounts, PhotoMarketplace, isMetaMask, coin } = this.state;
        
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning");
          return;
        }

        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const buyAmount = photo.marketData.price;
        this.setState({ isLoading: true });

        try {
            await coin.methods.approve(marketplace_addr, buyAmount).send({ from: accounts[0] })
            .on('receipt', async(receipt) => {
                await PhotoMarketplace.methods.buyNFT(id, buyAmount).send({ from: accounts[0] });
                await this.getAllPhotos();
                this.setState({ isLoading: false });
            });
        } catch(err) {
            this.setState({ isLoading: false });
        }
    }
    
    getAllPhotos = async () => {
      const { PhotoMarketplace } = this.state;
      const allPhotos = await PhotoMarketplace.methods.getAllPhotos().call();
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
              // Create instance of contracts
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

      if (preprops != this.props) {
        this.setState({
          isMetaMask: this.props.connected,
        })
        if (web3 != null) {
            await this.getAllPhotos();
        }
      }
    }

    render() {
        const { web3, allPhotos, currentAccount, isMetaMask } = this.state;
        console.log('allPhotos', allPhotos, isMetaMask, currentAccount);
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
                            let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"gwei");
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
                                                    <span>{ItemPrice} NFD</span>
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
                            let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"gwei");
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
                                                    <span>{ItemPrice} NFD</span>
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