import React, { Component } from "react";
import { Button, Mail} from 'rimble-ui';
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import getWeb3 from "../../utils/getWeb3";
import styles from '../../App.module.scss';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import ScreenLoading from "../Loading/screenLoading";
import ItemLoading  from "../Loading/itemLoading";
import addresses from "../../config/address.json";

const { marketplace_addr, nft_addr } = addresses;

class FolderItem extends Component {
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
          activeCategory: null,
          folderData: []
        };

        this.buyPhotoNFT = this.buyPhotoNFT.bind(this);
    }

    buyPhotoNFT = async (id) => {
        const { accounts, PhotoMarketplace, isMetaMask } = this.state;
        
        if (!isMetaMask) {
          NotificationManager.warning("Metamask is not connected!", "Warning");
          return;
        }

        const photo = await PhotoMarketplace.methods.getPhoto(id).call();
        const buyAmount = photo.marketData.price;
        this.setState({ isLoading: true });

        try {
            await PhotoMarketplace.methods.buyNFT(id).send({ from: accounts[0], value: buyAmount });
            await this.getAllPhotos();
            NotificationManager.success("Success");
            this.setState({ isLoading: false });
        } catch(err) {
            NotificationManager.error("Failed");
            this.setState({ isLoading: false });
        }
    }
    
    getAllPhotos = async () => {
        const { PhotoMarketplace, activeCategory } = this.state;
        this.setState({
            itemLoading: true
        })
        const { id } = this.props.match.params;
        const folderList = await PhotoMarketplace.methods.getSubFolderItem(id).call();
        let mainList = []; let index = 0;
        await Promise.all(folderList.map(async(item) => {
            try {
            const response = await fetch(`${process.env.REACT_APP_IPFS}/ipfs/${item.nftData.tokenURI}`);
            if(response.ok) {
                const json = await response.json();
                mainList[index] = {};
                mainList[index] = { ...item, ...json };
                index ++;
            }
            } catch (err) { }
        }))

        console.log(mainList);
        switch(activeCategory) {
            case "physical":
                mainList = mainList.filter(item => item.category == activeCategory);
                break;
            case "digital":
                mainList = mainList.filter(item => item.category == activeCategory);
                break;
        }

        this.setState({
            allPhotos: mainList,
            itemLoading: false
        });
    }

    componentDidMount = async () => {
    
      let PhotoNFT = {};
      let PhotoMarketplace = {};
      let COIN = [];
      try {
          PhotoNFT = require("../../abi/PhotoNFT.json");
          PhotoMarketplace = require("../../abi/PhotoMarketplace.json");
          
          //console.log(marketplace_addr, PhotoMarketplace);
      } catch (e) {
          ////console.log(e);
      }

      try {
        
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
                }
            );
        } else {
            this.setState({
                web3,
                accounts,
                balance,
                networkType,
                currentAccount
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
      const { web3, activeCategory } = this.state;

      if (preprops != this.props) {
        this.setState({
          isMetaMask: this.props.connected,
        })
        if (web3 != null) {
            await this.getAllPhotos();
        }
      }

      if (prevState.activeCategory != activeCategory) {
        await this.getAllPhotos();
      }
    }

    render() {
        const { web3, allPhotos, currentAccount, isMetaMask, isLoading, itemLoading } = this.state;
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
                { isLoading && <ScreenLoading/> }
                <Breadcrumb img="marketplace"/>
                <div className="explore-area">
                    { itemLoading && <ItemLoading/> }
                    {
                        !itemLoading &&
                        <div className="row items" style={{minHeight: '300px'}}>
                            {premiumNFT.map((item, idx) => {
                                let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"ether");
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
                                                        <span>{ItemPrice} BNB</span>
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
                                let ItemPrice = web3.utils.fromWei(`${item.marketData.price}`,"ether");
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
                                                        <span>{ItemPrice} BNB</span>
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
                    }
                </div>
                    
            </>
        );
    }
}

const mapToStateProps = ({wallet}) => ({
  connected: wallet.wallet_connected
})

export default connect(mapToStateProps, null)(FolderItem);