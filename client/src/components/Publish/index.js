import React, { Component } from "react";
import getWeb3 from "../../utils/getWeb3";
import ipfs from '../ipfs/ipfsApi.js'
import { Input, Field, Textarea } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
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
          NFTDesc: '',
          valueNFTName: "",
          valueNFTSymbol: "",
          valuePhotoPrice: "",
          photoNFT: null,

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

    handleNFTSymbol(event) {
      this.setState({ valueNFTSymbol: event.target.value });
    }

    handlePhotoPrice(event) {
        this.setState({ valuePhotoPrice: event.target.value });
    }

    captureFile(event) {
        event.preventDefault()
        const file = event.target.files[0]
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)  // Read bufffered file
        // Callback
        reader.onloadend = () => {
          this.setState({ buffer: Buffer(reader.result) })
        }
    }
      
    async onSubmit(event) {
        const {
          web3,
          accounts,
          PhotoNFT,
          valueNFTName,
          NFTDesc,
          isMetaMask
        } = this.state;

        event.preventDefault();
        //console.log(web3);
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning")
          return;
        }
        try {
        const saveImageResult = await ipfs.files.add(this.state.buffer);
        const imageHash = saveImageResult[0].hash;
        const nftContent = {
            nftName: valueNFTName,
            image: imageHash,
            nftDesc: NFTDesc,
            createdAt: new Date()
        };
        
        const cid = await ipfs.files.add(
            Buffer.from(JSON.stringify(nftContent))
        );
        await PhotoNFT.methods.mint(cid[0].hash).send({ from: accounts[0] })
        .on('receipt', res => {
        });
      } catch (e) {
          //console.log(e);
      }
    }

    componentDidMount = async () => {
        const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
        
        let PhotoNFT = {};
        let PhotoMarketplace = {};
        try {
          PhotoNFT = require("../../../../build/contracts/PhotoNFT.json"); // Load ABI of contract of PhotoNFT
          PhotoMarketplace = require("../../../../build/contracts/PhotoMarketplace.json");
        } catch (e) {
          //console.log(e);
        }

        try {
          const isProd = process.env.NODE_ENV === 'production';
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
                    hotLoaderDisabled,
                    currentAccount
                });
            }
        }
        } catch (error) {
          console.error('error=>',error);
        }
    };

    async componentDidUpdate(preprops) {
      if (preprops != this.props) {
        this.setState({
          isMetaMask: this.props.connected,
        })
      }
    }

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    refreshValues = (instancePhotoNFT) => {
        if (instancePhotoNFT) {
          //console.log('refreshValues of instancePhotoNFT');
        }
    }

    render()  {
        const { isMetaMask } = this.state;
        return (
          <>
            <Breadcrumb img="mint"/>
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