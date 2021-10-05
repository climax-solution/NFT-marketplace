import React, { Component } from "react";
import Loader from "react-loader-spinner";

import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
    Button,
    Card,
    Input,
    Table,
    Form,
    Field,
    Image,
} from "rimble-ui";
import { zeppelinSolidityHotLoaderOptions } from "../../../config/webpack";

// import styles from "../../App.module.scss";
import "./products.css";
import { SetStatus } from "../../store/action/wallet.actions";
import { connect } from "react-redux";

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
            allPhotos: [],
            assets: [],
            isLoading: true,
            isMetaMask: false
        };

        //this.handlePhotoNFTAddress = this.handlePhotoNFTAddress.bind(this);

        this.putOnSale = this.putOnSale.bind(this);
        this.cancelOnSale = this.cancelOnSale.bind(this);
    }

    ///--------------------------
    /// Handler
    ///--------------------------
    // handlePhotoNFTAddress(event) {
    //     this.setState({ valuePhotoNFTAddress: event.target.value });
    // }

    ///---------------------------------------------------------
    /// Functions put a photo NFT on sale or cancel it on sale
    ///---------------------------------------------------------
    putOnSale = async (id, idx) => {
        const {
            web3,
            accounts,
            photoNFT,
        } = this.state;

        console.log("=== value of putOnSale ===", id);

        /// Check owner of photoId
        const photoId = id; /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        
        
        const txReceipt2 = await photoNFT.methods
            .openTrade(photoId)
            .send({ from: accounts[0] });
        console.log("=== response of openTrade ===", txReceipt2);
        await this.getAllPhotos();
    };

    cancelOnSale = async (id, idx) => {
        const {
            web3,
            accounts,
            photoNFT,
        } = this.state;

        console.log("=== value of cancelOnSale ===", id);

        const photoId = id;
        /// Cancel on sale
        //const txReceipt1 = await photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] });
        const txReceipt2 = await photoNFT.methods
            .cancelTrade(photoId)
            .send({ from: accounts[0] });
        console.log("=== response of cancelTrade ===", txReceipt2);
        await this.getAllPhotos();
    };

    ///-------------------------------------
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllPhotos = async () => {
        const { photoNFT } = this.state;

        const allPhotos = await photoNFT.methods.getAllPhotos().call();
        console.log("=== allPhotos ===", allPhotos);

        this.setState({ allPhotos: allPhotos });
        return allPhotos;
    };

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
    };

    async componentDidMount() {
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
            // this.setState({ allPhotos: allPhotos});
            this.checkAssets(allPhotos);
        } catch (error) {
            // Catch any errors for any of the above operations.
            // alert(
            //     `Failed to load web3, accounts, or contract. Check console for details.`
            // );
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
            console.log("refreshValues of instancePhotoNFTMarketplace");
        }
    };

    checkAssets(allPhotos) {
        const { currentAccount } = this.state;
        const list = allPhotos.filter(item => currentAccount == item.ownerAddress);
        this.setState({
            assets: list
        })
    }
    render() {
        const { web3, assets, currentAccount, isMetaMask } = this.state;

        console.log('render', isMetaMask)

        return (
            <>
                <Breadcrumb title="ASSETS"/>
                {
                    !isMetaMask ?
                    <Loader
                        type="ThreeDots"
                        color="#00BFFF"
                        height={100}
                        width={100}
                        className="text-center"
                    />:
                    <div className="row items" style={{padding: '30px 0'}}>
                        {assets.map((item, idx) => {
                            if (currentAccount == item.ownerAddress) {
                                return (
                                    <div className="col-12 col-sm-6 col-lg-3 item" ket={idx}>
                                        <div className="card" key={`exo_${idx}`}>
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
                                                    {item.status == "1" ? ( // this means "Cancelled"
                                                        <Button
                                                            size={"medium"}
                                                            width={1}
                                                            className="btn"
                                                            onClick={() => this.putOnSale(item.photoId, idx)}
                                                        >
                                                            {" "}
                                                            Put on sale{" "}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size={"medium"}
                                                            width={1}
                                                            onClick={() => this.cancelOnSale(item.photoId, idx)}
                                                            className="btn"
                                                        >
                                                            {" "}
                                                            Cancel on sale{" "}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            else return <></>;
                        })}
                        {
                            !assets.length && <h2 className="text-center text-muted">No items.</h2>
                        }
                    </div>
                }
            </>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setConnection: (status) => dispatch(SetStatus(status))
})
export default connect(null, mapDispatchToProps)(MyPhotos);