import React, { Component } from "react";
import Swal from "sweetalert2";
import { Button } from 'rimble-ui';
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import addresses from "../../config/address.json";
import getWeb3 from "../../utils/getWeb3";
import ScreenLoading from "../Loading/screenLoading";
import ItemLoading  from "../Loading/itemLoading";
import "./custom.css";

const { marketplace_addr, nft_addr, token_addr } = addresses;

class MyPhotos extends Component {
    constructor(props) {    
        super(props);
        this.state = {
          web3: null,
          accounts: null,
          currentAccount: null,          
          allPhotos: [],
          coin: null,
          isLoading: false,
          itemLoading: true,
          isMetaMask: false,
          PhotoMarketplace: {},
          PhotoNFT: {},
        };

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
          const { web3, accounts, PhotoMarketplace, PhotoNFT, coin } = this.state;
          this.setState({
            isLoading: true
          })

          try {
            const photoPrice = web3.utils.toWei((result.value).toString(), 'ether');
            await PhotoNFT.methods.approve(marketplace_addr, id).send({from : accounts[0]});
            // await coin.methods.approve(marketplace_addr, photoPrice).send({ from: accounts[0] });
            await PhotoMarketplace.methods.openTrade(id).send({ from: accounts[0], value: photoPrice / 20 })
            .then( async(res) => {
              this.setState({
                isLoading: false
              })
              NotificationManager.success("Success");
              await this.getAllPhotos();
            })
          } catch(err) {
            NotificationManager.error("Failed");
            this.setState({
              isLoading: false
            })
          }
        }
      })
        
    }

    cancelOnSale = async (id) => {
        const { coin, accounts, PhotoMarketplace } = this.state;
        this.setState({
          isLoading: true
        })
        try {
          const photo = await PhotoMarketplace.methods.getPhoto(id).call();
          const buyAmount = photo.marketData.price;
          // await coin.methods.approve(marketplace_addr, buyAmount).send({ from: accounts[0] });
          await PhotoMarketplace.methods.cancelTrade(id).
          send({ from: accounts[0], value: buyAmount / 20 }).
          then(async(result) => {
            this.setState({
              isLoading: false
            })
            NotificationManager.success("Success");
            await this.getAllPhotos();
          });
        } catch(err) {
          NotificationManager.error("Failed");
          this.setState({
            isLoading: false
          })
        }
    }

    putOnPremium = async (id) => {
        const { accounts, PhotoMarketplace, coin } = this.state;
        this.setState({
          isLoading: true
        })
        try {
          const photo = await PhotoMarketplace.methods.getPhoto(id).call();
          const tax = photo.marketData.price;
          await PhotoMarketplace.methods.updatePremiumStatus(id, true).send({ from: accounts[0], value: tax / 10});
          this.setState({
            isLoading: false
          })
          NotificationManager.success("Success");
          await this.getAllPhotos();
        } catch(err) {
          NotificationManager.error("Failed");
          this.setState({
            isLoading: false
          })
        }
    }

    putOnNormal = async (id) => {
        const { accounts, PhotoMarketplace, coin } = this.state;
        this.setState({
          isLoading: true
        })
        try {
          const photo = await PhotoMarketplace.methods.getPhoto(id).call();
          const tax = photo.marketData.price;
          await PhotoMarketplace.methods.updatePremiumStatus(id, false).send({ from: accounts[0], value: tax / 10});
          this.setState({
            isLoading: false
          })
          NotificationManager.success("Success");
          await this.getAllPhotos();
        } catch(err) {
          NotificationManager.error("Failed");
          this.setState({
            isLoading: false
          })
        }
    }

    getAllPhotos = async () => {
      const { PhotoMarketplace} = this.state;
      this.setState({
        itemLoading: true
      });
      const allPhotos = await PhotoMarketplace.methods.getAllPhotos().call();
      console.log("=== allPhotos ===", allPhotos);
      const finalResult = await Promise.all(allPhotos.map(async (item) => {
          const response = await fetch(`http://localhost:8080/ipfs/${item.nftData.tokenURI}`);
          if(!response.ok)
              throw new Error(response.statusText);

          const json = await response.json();
          
          return {...item, ...json}
      }) );

      this.checkAssets(finalResult);
      this.setState({
        itemLoading: false
      })
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

    checkAssets(allPhotos) {
      const { currentAccount } = this.state;
      const list = allPhotos.filter(item => currentAccount == item.nftData.owner);
      this.setState({
          assets: list
      })
    }
    render() {
        const { web3, assets, currentAccount, isMetaMask, isLoading, itemLoading } = this.state;
        return (
          <>
            { isLoading && <ScreenLoading/> }
            <Breadcrumb img="assets"/>
            { itemLoading && <ItemLoading/> }
            {
              !itemLoading &&
                <div className="row items" style={{padding: '30px 0'}}>
                    {assets.map((item, idx) => {
                        if (!isMetaMask && currentAccount == item.nftData.owner) return <></>;
                        let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"ether");
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