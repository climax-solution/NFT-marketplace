import React, { Component } from "react";
import getWeb3 from "../../utils/getWeb3";

import { Button } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import { connect } from "react-redux";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Swal from "sweetalert2";
import "./custom.css";
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
          isMetaMask: undefined,
          marketplaceAddress: '',
          coin: null
        };

        //this.handlePhotoNFTAddress = this.handlePhotoNFTAddress.bind(this);

        this.putOnSale = this.putOnSale.bind(this);
        this.cancelOnSale = this.cancelOnSale.bind(this);
    }

    putOnSale = async (id) => {
      await Swal.fire({
        title: '<span style="font-size: 22px">PLEASE ENTER PRICE</span>',
        input: 'number',
        width: 350,
        inputAttributes: {
          autocapitalize: 'off',
        },
        inputValidator: (value) => {
          if (value < 0.1)  return "Price must be greater than 0.1.";
        },
        color: '#000',
        showCancelButton: true,
        confirmButtonText: 'OK',
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading()
      }).then(async(result) => {
        if (result.isConfirmed) {
          const { web3, accounts, PhotoMarketplace, PhotoNFT, marketplaceAddress, coin } = this.state;

          //console.log('=== value of putOnSale ===', id);
          //console.log('=== PHOTO_NFT_MARKETPLACE ===', marketplaceAddress );

          const photoPrice = web3.utils.toWei((result.value).toString(), 'gwei');

          await PhotoNFT.methods.approve(marketplaceAddress, id).send({from : accounts[0]});
          await coin.methods.approve(marketplaceAddress, photoPrice).send({ from: accounts[0] });
          await PhotoMarketplace.methods.openTrade(id, photoPrice).send({ from: accounts[0] })
          .then( async(res) => {
            await this.getAllPhotos();
          })
        }
      })
        
    }

    cancelOnSale = async (id) => {
        const { coin, accounts, PhotoMarketplace, marketplaceAddress } = this.state;

        console.log('=== value of cancelOnSale ===', marketplaceAddress);
        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const buyAmount = photo.marketData.price;
        await coin.methods.approve(marketplaceAddress, buyAmount).send({ from: accounts[0] });
        await PhotoMarketplace.methods.cancelTrade(id, buyAmount).
        send({ from: accounts[0] }).
        then(async(result) => {
          await this.getAllPhotos();
        });
    }

    putOnPremium = async (id) => {
        const { accounts, PhotoMarketplace, coin, marketplaceAddress } = this.state;
        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const tax = photo.marketData.price / 20;
        await coin.methods.approve(marketplaceAddress, tax).send({ from: accounts[0] });
        const txReceipt2 = await PhotoMarketplace.methods.updatePremiumStatus(id, true, tax).send({ from: accounts[0]});
        ////console.log('=== response of putOnPremium ===', txReceipt2);
        await this.getAllPhotos();
    }

    putOnNormal = async (id) => {
        const { accounts, PhotoMarketplace, coin, marketplaceAddress } = this.state;
        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const tax = photo.marketData.price / 20;
        await coin.methods.approve(marketplaceAddress, tax).send({ from: accounts[0] });
        const txReceipt2 = await PhotoMarketplace.methods.updatePremiumStatus(id, false, tax).send({ from: accounts[0]});
        //console.log('=== response of putOnNormal ===', txReceipt2);
        await this.getAllPhotos();
    }

    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllPhotos = async () => {
      const { PhotoMarketplace} = this.state;
      const allPhotos = await PhotoMarketplace.methods.getAllPhotos().call();
      console.log("=== allPhotos ===", allPhotos);
      const finalResult = await Promise.all(allPhotos.map(async (item) => {
          const response = await fetch(`http://localhost:8080/ipfs/${item.nftData.tokenURI}`);
          if(!response.ok)
              throw new Error(response.statusText);

          const json = await response.json();
          
          return {...item, ...json}
      }) );

      ////console.log('async result', allPhotos)
      this.checkAssets(finalResult);
    }

    componentDidMount = async () => {
      const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;

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
              let instanceCoin = null;
              let marketplaceAddress = null;

              instanceCoin = new web3.eth.Contract(
                  COIN, "0xd2799A6a36CF2994c977005F7632Ff0882505370"
              );
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
                  deployedNetwork =
                      PhotoMarketplace.networks[networkId.toString()];
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
                          PhotoMarketplace: instancePhotoMarketplace,
                          marketplaceAddress,
                          currentAccount,
                          coin: instanceCoin
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
                      currentAccount,
                      coin: instanceCoin
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
          const accounts = await web3.eth.getAccounts();
          this.setState({
            currentAccount: this.props.connected ? accounts[0] : ''
          })
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

    checkAssets(allPhotos) {
      const { currentAccount } = this.state;
      const list = allPhotos.filter(item => currentAccount == item.nftData.owner);
      this.setState({
          assets: list
      })
    }
    render() {
        const { web3, assets, currentAccount, isMetaMask } = this.state;
        return (
          <>
            <Breadcrumb img="assets"/>
            {
                <div className="row items" style={{padding: '30px 0'}}>
                    {assets.map((item, idx) => {
                        if (!isMetaMask && currentAccount == item.nftData.owner) return <></>;
                        let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"gwei");
                        const pidx = ItemPrice.indexOf('.');
                        const pLen = ItemPrice.length;
                        if (pidx > 0) {
                          if (pLen - pidx > 3) {
                            ItemPrice = ItemPrice.substr(0, pidx + 4);
                          }
                        }
                        //console.log('isMetaMask=>',currentAccount);
                        if (currentAccount == item.nftData.owner) {
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
                                                    <span>{ItemPrice} NFTD</span>
                                                </div>
                                                { !item.marketData.marketStatus ? 
                                                    <Button
                                                      size={'medium'}
                                                      width={1}
                                                      className="btn"
                                                      onClick={() => this.putOnSale(item.nftData.tokenID)}
                                                    > Put on sale </Button>
                                                :
                                                    <Button
                                                      size={'medium'}
                                                      width={1}
                                                      className="btn"
                                                      onClick={() => this.cancelOnSale(item.nftData.tokenID)}
                                                    > Cancel on sale </Button>
                                                }
                                                  <div style={{ padding: "5px" }}></div>

                                                  {/* premium */}
                                                  {
                                                      item.marketData.premiumStatus && item.marketData.marketStatus && 
                                                        <Button
                                                          size={'medium'}
                                                          width={1}
                                                          className="btn"
                                                          onClick={() => this.putOnNormal(item.nftData.tokenID)}
                                                        >Make it normal </Button>
                                                  }
                                                  {
                                                    !item.marketData.premiumStatus && item.marketData.marketStatus &&
                                                        <Button
                                                          size={'medium'}
                                                          width={1}
                                                          className="btn"
                                                          onClick={() => this.putOnPremium(item.nftData.tokenID)}
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
                        (isMetaMask && currentAccount && !assets.length) && <h4 className="text-center text-muted ml-2">No items.</h4>
                    }
                    {
                      (!isMetaMask || !currentAccount) && <h4 className="text-center text-muted ml-2">Connect Metamask.</h4>
                    }
                </div>
            }
          </>
        );
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(MyPhotos);