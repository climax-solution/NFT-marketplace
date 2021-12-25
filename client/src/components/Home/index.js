import React, { Component } from "react";
import { connect } from "react-redux";
import getWeb3 from "../../utils/getWeb3";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {  Button } from 'rimble-ui';
import { NotificationManager } from "react-notifications";
import addresses from "../../config/address.json";
import ItemLoading  from "../Loading/itemLoading";
import ScreenLoading from "../Loading/screenLoading";

const { marketplace_addr, nft_addr } = addresses;

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
            itemLoading: true,
            isMetaMask: false,
            PhotoMarketplace: {},
            PhotoNFT: {}
        };

        this.buyPhotoNFT = this.buyPhotoNFT.bind(this);
    }
    
    buyPhotoNFT = async (id) => {
        console.log(id);
        const { accounts, PhotoMarketplace, isMetaMask } = this.state;
        
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning");
          return;
        }

        this.setState({ isLoading: true });
        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const buyAmount = photo.marketData.price;
        try {
            await PhotoMarketplace.methods.buyNFT(id).send({ from: accounts[0], value: buyAmount });
            await this.getAllPhotos();
            NotificationManager.success("Success");
            this.setState({ isLoading: false });
        } catch(err) {
            NotificationManager.error("Failed");
            this.setState({ isLoading: false });
        }
        this.setState({ isLoading: false });
    }
    
    getAllPhotos = async () => {
        const {  PhotoMarketplace } = this.state;
        this.setState({
            itemLoading: true
        })
        let allPhotos = await PhotoMarketplace.methods.getPremiumNFTList().call();
        let mainList = []; let index = 0;
        allPhotos = allPhotos.filter(item => item.marketData.premiumStatus && item.marketData.marketStatus );
        await Promise.all(allPhotos.map(async (item,) => {
            try {
                const response = await fetch(`${item.nftData.tokenURI}`);
                if(response.ok) {
                    const json = await response.json();
                    mainList.push({ ...item, ...json });
                }
            } catch (err) {
            }
            return item;
        }) );
        mainList.sort((before, after) => {
            return before.marketData.premiumTimestamp - after.marketData.premiumTimestamp;
        })
        this.setState({
            allPhotos: mainList,
            itemLoading: false
        });
    }

    init = async () => {
    
        let PhotoNFT = {};
        let PhotoMarketplace = {};
        try {
            PhotoNFT = require("../../abi/PhotoNFT.json");
            PhotoMarketplace = require("../../abi/PhotoMarketplace.json");
        } catch (e) {
            //console.log(e);
        }
  
        try {
            
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();

            const networkType = await web3.eth.net.getNetworkType();
            let balance =
                accounts.length > 0
                    ? await web3.eth.getBalance(accounts[0])
                    : web3.utils.toWei("0");
            balance = web3.utils.fromWei(balance, "ether");

            let instancePhotoNFT = null;
            let instancePhotoMarketplace = null;
            
            if (PhotoNFT) {
                instancePhotoNFT = new web3.eth.Contract(PhotoNFT, nft_addr);
            }

            if (PhotoMarketplace) {
                instancePhotoMarketplace = new web3.eth.Contract(PhotoMarketplace, marketplace_addr);
            }

            if (instancePhotoNFT && instancePhotoMarketplace) {
                this.setState(
                    {
                        web3,
                        accounts,
                        balance,
                        networkType,
                        PhotoNFT: instancePhotoNFT,
                        PhotoMarketplace: instancePhotoMarketplace
                    }
                );
            } else {
                this.setState({
                    web3,
                    accounts,
                    balance,
                    networkType
                });
            }
            
            if (navigator.onLine) await this.getAllPhotos();
            else this.setState({ isLoading: false });

        } catch (error) {
            console.error(error);
        }
    };

    async componentDidMount() {
        await this.init();
    }

    async componentDidUpdate(preprops) {

        if (preprops != this.props) {
            await this.init();
            this.setState({
                isMetaMask: this.props.connected,
            })
            const { web3 } = this.state;
            const accounts = await web3.eth.getAccounts();
            this.setState({
                currentAccount: this.props.connected ? accounts[0] : ''
            })
            if (web3 != null) {
                await this.getAllPhotos();
            }
        }
    }

    render() {
        const { web3, allPhotos, currentAccount, isMetaMask, itemLoading, isLoading } = this.state;
        let List = allPhotos.filter(item => item.nftData.owner != currentAccount || !isMetaMask);
        //console.log(List);
        return(
            <>
                { isLoading && <ScreenLoading/> }
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
                { itemLoading && <ItemLoading/> }
                {
                    !itemLoading &&
                    <div className="row items" style={{minHeight: '300px'}}>
                        {
                        List.map((item, idx) => {
                            return (
                                <div className="col-12 col-sm-6 col-lg-3 item" key={idx}>
                                    <div className="card">
                                        <div className="image-over">
                                            <a href={`/item-details/${item.nftData.tokenID}`}><img className="card-img-top" src={`${item.image}`} alt="" /></a>
                                        </div>
                                        {/* Card Caption */}
                                        <div className="card-caption p-0">
                                            {/* Card Body */}
                                            <div className="card-body">
                                                <div className="card-bottom d-flex justify-content-between">
                                                    <span>Token Name</span>
                                                    <span>Price</span>
                                                </div>
                                                <div className="card-bottom d-flex justify-content-between">
                                                    <span>{item.nftName || item.nftname }</span>
                                                    <span>{web3.utils.fromWei(item.marketData.price, "ether")} BNB</span>
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
                }
            </>
        )
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(Home);