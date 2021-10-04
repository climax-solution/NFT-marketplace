import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Loader, Button, Card, Input, Table, Form, Field, Image } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { SetStatus } from "../../store/action/wallet.actions";
import { connect } from "react-redux";


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
          photoNFT : null, 

          /////// NFT
          allPhotos: [],
          loading: false
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
    buyPhotoNFT = async (e) => {
        const { web3, accounts, photoNFT } = this.state;

        console.log('photoNFT', photoNFT);
        //const { web3, accounts, photoNFTMarketplace, photoNFTData, valuePhotoNFTAddress } = this.state;

        console.log('=== value of buyPhotoNFT ===', e.target.value);

        const photoId = e.target.value;
        
       
        const photo = await photoNFT.methods.getPhoto(photoId).call();
        const buyAmount = photo.photoPrice;
        const txReceipt1 = await photoNFT.methods.buyNFT(photoId).send({ from: accounts[0], value: buyAmount });
        console.log('=== response of buyPhotoNFT ===', txReceipt1);

        await this.getAllPhotos();
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
        const { photoNFT } = this.state

        const allPhotos = await photoNFT.methods.getAllPhotos().call()
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

        let PhotoNFT = {};
        try {
            PhotoNFT = require("../../../../build/contracts/PhotoNFT.json"); // Load ABI of contract of PhotoNFTFactory
        } catch (e) {
            console.log(e);
        }

        try {
            const isProd = process.env.NODE_ENV === "production";
            if (!isProd) {
                // Get network provider and web3 instance.
                const web3 = await getWeb3("load");
                let ganacheAccounts = [];

                try {
                    ganacheAccounts = await this.getGanacheAddresses();
                } catch (e) {
                    console.log("Ganache is not running");
                }

                // Use web3 to get the user's accounts.
                const accounts = await web3.eth.getAccounts();
                const currentAccount = accounts[0];

                // Get the contract instance.
                const networkId = await web3.eth.net.getId();
                const networkType = await web3.eth.net.getNetworkType();
                const isMetaMask = web3.currentProvider.isMetaMask;
                this.props.setConnection(isMetaMask);
                let balance =
                    accounts.length > 0
                        ? await web3.eth.getBalance(accounts[0])
                        : web3.utils.toWei("0");
                balance = web3.utils.fromWei(balance, "ether");

                let instancePhotoNFT = null;
                let deployedNetwork = null;

                // Create instance of contracts
                if (PhotoNFT.networks) {
                    deployedNetwork = PhotoNFT.networks[networkId.toString()];
                    if (deployedNetwork) {
                        instancePhotoNFT = new web3.eth.Contract(
                            PhotoNFT.abi,
                            deployedNetwork && deployedNetwork.address
                        );
                        console.log(
                            "=== instancePhotoNFT ===",
                            instancePhotoNFT
                        );
                    }
                }
                if (instancePhotoNFT) {
                    // Set web3, accounts, and contract to the state, and then proceed with an
                    // example of interacting with the contract's methods.
                    this.setState(
                        {
                            web3,
                            ganacheAccounts,
                            accounts,
                            balance,
                            networkId,
                            networkType,
                            hotLoaderDisabled,
                            isMetaMask,
                            photoNFT: instancePhotoNFT,
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
                        ganacheAccounts,
                        accounts,
                        balance,
                        networkId,
                        networkType,
                        hotLoaderDisabled,
                        isMetaMask,
                    });
                }
            }
            ///@dev - NFT（Always load listed NFT data
            const allPhotos = await this.getAllPhotos();
            this.setState({ allPhotos: allPhotos })
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.error(error);
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

    render() {
        const { web3, allPhotos, currentAccount } = this.state;

        return (
            <>
                <Breadcrumb title="MARKETPLACE"/>
                <div className="row items" style={{minHeight: '300px'}}>
                    {allPhotos.map((item, idx) => {
                        if (currentAccount != item.ownerAddress) {
                            return (
                                <div className="col-12 col-sm-6 col-lg-3 item" key={`exo_${idx}`}>
                                    <div className="card">
                                        <div className="image-over">
                                            <img className="card-img-top" src={`http://localhost:8080/ipfs/${item.ipfsHashOfPhoto}`} alt="" />
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
                                                    <span>{item.photoName}</span>
                                                    <span>{web3.utils.fromWei(
                                                        `${item.photoPrice}`,
                                                        "ether"
                                                    )}</span>
                                                </div>
                                                <Button
                                                    size={'medium'}
                                                    width={1}
                                                    value={ item.photoId }
                                                    onClick={this.buyPhotoNFT}
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
                </div>
            </>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setConnection: (status) => dispatch(SetStatus(status))
})
export default connect(null, mapDispatchToProps)(PhotoMarketplace);