import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";
import ipfs from '../ipfs/ipfsApi.js'

import { Grid } from '@material-ui/core';
import { Loader, Button, Card, Input, Heading, Table, Form, Field, Textarea } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import { confirmAlert } from 'react-confirm-alert';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { SetStatus } from "../../store/action/wallet.actions";
import { connect } from "react-redux";
import  {NotificationManager} from "react-notifications";
import styles from "../../App.module.scss";
import 'react-confirm-alert/src/react-confirm-alert.css';

class Publish extends Component {
    constructor(props) {    
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          route: window.location.pathname.replace("/", ""),

          /////// NFT concern
          valueNFTName: '',
          NFTDesc: '',
          valuePhotoPrice: '',

          /////// Ipfs Upload
          buffer: null,
          ipfsHash: ''
        };

        /////// Handle
        this.handleNFTName = this.handleNFTName.bind(this);
        this.handleNFTDesc = this.handleNFTDesc.bind(this);
        this.handlePhotoPrice = this.handlePhotoPrice.bind(this);

        /////// Ipfs Upload
        this.captureFile = this.captureFile.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    ///--------------------------
    /// Handler
    ///-------------------------- 
    handleNFTName(event) {
        this.setState({ valueNFTName: event.target.value });
    }

    handleNFTDesc(event) {
        this.setState({ NFTDesc: event.target.value });
    }

    handlePhotoPrice(event) {
        this.setState({ valuePhotoPrice: event.target.value });
    }

    ///--------------------------
    /// Functions of ipfsUpload 
    ///-------------------------- 
    captureFile(event) {
        event.preventDefault()
        const file = event.target.files[0]
        
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)  // Read bufffered file

        // Callback
        reader.onloadend = () => {
          this.setState({ buffer: Buffer(reader.result) })
          console.log('=== buffer ===', this.state.buffer)
        }
    }
      
    onSubmit(event) {
        const {
          web3,
          accounts,
          photoNFTFactory,
          photoNFTMarketplace,
          PHOTO_NFT_MARKETPLACE,
          valueNFTName,
          NFTDesc,
          valuePhotoPrice,
          isMetaMask
        } = this.state;

        event.preventDefault()
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning")
          return;
        }
        // ipfs.files.add(this.state.buffer, (error, result) => {
          // In case of fail to upload to IPFS

          // console.log('add function')

          // if (error) {
          //   console.log('error', error)
          //   console.error(error)
          //   return
          // }

          // // In case of successful to upload to IPFS
          // this.setState({ ipfsHash: result[0].hash });
          console.log('=== ipfsHash ===', this.state.ipfsHash);

          const nftName = valueNFTName;
          const nftSymbol = "NFT DEVELOPMENTS";  /// [Note]: All NFT's symbol are common symbol
          //const nftSymbol = NFTDesc;
          
          const _photoPrice = valuePhotoPrice;
          console.log('_photoPrice',_photoPrice)
          console.log('=== nftName ===', nftName);
          console.log('=== nftSymbol ===', nftSymbol);
          console.log('=== _photoPrice ===', _photoPrice);
          this.setState({ 
            valueNFTName: '',
            NFTDesc: '',
            valuePhotoPrice: '',
            buffer: ''
          });

          //let PHOTO_NFT;  /// [Note]: This is a photoNFT address created
          console.log("WEB3=>", photoNFTFactory);
          const photoPrice = web3.utils.toWei(_photoPrice, 'ether'); // _photoPrice * 1.05 - trasaction fee 5%
          console.log('photoPrice', photoPrice)
          let BN = web3.utils.BN;

          const fee = new BN(photoPrice).div(new BN("20"));
          console.log(fee);
          const ipfsHashOfPhoto = this.state.ipfsHash;
          photoNFTFactory.methods.createNewPhotoNFT(nftName, nftSymbol, photoPrice, ipfsHashOfPhoto, NFTDesc)
          .send({ from: accounts[0], value: fee })
          .once('receipt', (receipt) => {
            console.log('=== receipt ===', receipt);

            const PHOTO_NFT = receipt.events.PhotoNFTCreated.returnValues.photoNFT;
            console.log('=== PHOTO_NFT ===', PHOTO_NFT);

            /// Get instance by using created photoNFT address
            // let PhotoNFT = {};
            // PhotoNFT = require("../../abi/PhotoNFT.json"); 
            // let photoNFT = new web3.eth.Contract(PhotoNFT, PHOTO_NFT);
            // console.log('=== photoNFT ===', photoNFT);
     
            // /// Check owner of photoId==1
            // const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
            // // photoNFT.methods.ownerOf(photoId).call().then(owner => console.log('=== owner of photoId 1 ===', owner));
            
            // /// [Note]: Promise (nested-structure) is needed for executing those methods below (Or, rewrite by async/await)
            // photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] }).once('receipt', (receipt) => {
            //     /// Put on sale (by a seller who is also called as owner)
            //     // photoNFTMarketplace.methods.openTradeWhenCreateNewPhotoNFT(PHOTO_NFT, photoId, photoPrice).send({ from: accounts[0] }).once('receipt', (receipt) => {})
            // })
          })
        // })
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
     
        let PhotoNFTFactory = {};
        let PhotoNFTMarketplace = {};
        try {
          PhotoNFTFactory = require("../../abi/PhotoNFTFactory.json"); // Load ABI of contract of PhotoNFTFactory
          PhotoNFTMarketplace = require("../../abi/PhotoNFTMarketplace.json");
        } catch (e) {
          console.log(e);
        }

        try {
          const isProd = process.env.NODE_ENV === 'production';
          if (!isProd) {
            // Get network provider and web3 instance.
            const web3 = await getWeb3("load");
            let ganacheAccounts = [];

            // try {
            //   ganacheAccounts = await this.getGanacheAddresses();
            // } catch (e) {
            //   console.log('Ganache is not running');
            // }

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const networkType = await web3.eth.net.getNetworkType();
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instancePhotoNFTFactory = null;
            let instancePhotoNFTMarketplace = null;
            let PHOTO_NFT_MARKETPLACE;
            let deployedNetwork = null;

            // Create instance of contracts
            // if (PhotoNFTFactory.networks) {
            //   // - deployedNetwork = PhotoNFTFactory.networks[networkId.toString()];
            //   if (deployedNetwork) {
                instancePhotoNFTFactory = new web3.eth.Contract(
                  PhotoNFTFactory,
                  process.env.REACT_APP_PHOTO_NFTFACTORY_ADDRESS,
                  {
                    gasPrice: "5000000000"
                  }
                );
                console.log('=== instancePhotoNFTFactory ===', process.env);
            //   }
            // }

            // if (PhotoNFTMarketplace.networks) {
            //   // - deployedNetwork = PhotoNFTMarketplace.networks[networkId.toString()];
            //   if (deployedNetwork) {
                PHOTO_NFT_MARKETPLACE = process.env.REACT_APP_PHOTO_MARKETPLACE_ADDRESS;
                instancePhotoNFTMarketplace = new web3.eth.Contract(
                  PhotoNFTMarketplace,
                  PHOTO_NFT_MARKETPLACE,
                );
                console.log('=== instancePhotoNFTMarketplace ===', instancePhotoNFTMarketplace);
                console.log('=== PHOTO_NFT_MARKETPLACE ===', PHOTO_NFT_MARKETPLACE);
            //   }
            // }

            if (instancePhotoNFTFactory) {
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
                    photoNFTFactory: instancePhotoNFTFactory,
                    photoNFTMarketplace: instancePhotoNFTMarketplace, 
                    PHOTO_NFT_MARKETPLACE: PHOTO_NFT_MARKETPLACE }, () => {
                      this.refreshValues(instancePhotoNFTFactory);
                      setInterval(() => {
                        this.refreshValues(instancePhotoNFTFactory);
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
          }
        } catch (error) {
          // Catch any errors for any of the above operations.
          // alert(
          //   `Failed to load web3, accounts, or contract. Check console for details.`,
          // );
          // console.error(error);
        }
    };

    async componentDidUpdate(preprops) {
      if (preprops != this.props) {
        let { currentAccount, web3 } = this.state;
        const { connected } = this.props;
        if (!connected) currentAccount = '';
        this.setState({
          isMetaMask: this.props.connected,
          currentAccount
        })
      }
    }

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    refreshValues = (instancePhotoNFTFactory) => {
        if (instancePhotoNFTFactory) {
          console.log('refreshValues of instancePhotoNFTFactory');
        }
    }

    render()  {
        return (
          <>
            <Breadcrumb title="MINT"/>
            <section className="author-area">
                <div className="container">
                    <div className="row mt-3 mb-3">
                        {/*  */}
                        <div className="col-12 col-sm-8 col-md-6 mx-auto">
                            {/* Item Form */}
                            <form className="item-form card no-hover" onSubmit={this.onSubmit}>
                                <Field label="Token Item Name" className="form-group">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="Art NFT Token"
                                        required={true}
                                        value={this.state.valueNFTName}
                                        onChange={this.handleNFTName}
                                    />
                                </Field>

                                <Field label="Token Price (unit: BNB)" className="form-group">
                                    <Input
                                        type="number"
                                        width={1}
                                        placeholder="10"
                                        required={true}
                                        value={this.state.valuePhotoPrice}
                                        onChange={this.handlePhotoPrice}
                                    />
                                </Field>

                                <Field label="Art for NFT" className="form-group">
                                    <input
                                        type="file"
                                        onChange={this.captureFile}
                                        required={true}
                                    />
                                </Field>

                                <Field label="Description" className="form-group">
                                    <Textarea
                                        required={true}
                                        value={this.state.NFTDesc}
                                        className="p-2"
                                        style={{height: '150px'}}
                                        onChange={this.handleNFTDesc}                                        
                                    />
                                </Field>
                                <button className="btn w-100 mt-3 mt-sm-4" type="submit">Create Item</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
          </>
        );
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(Publish);