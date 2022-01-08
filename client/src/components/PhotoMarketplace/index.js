import React, { Component } from "react";
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import getWeb3 from "../../utils/getWeb3";
import '../../App.module.scss';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import ScreenLoading from "../Loading/screenLoading";
import ItemLoading  from "../Loading/itemLoading";
import addresses from "../../config/address.json";

const { marketplace_addr, nft_addr } = addresses;

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
        const { accounts, PhotoMarketplace, isMetaMask, coin } = this.state;
        
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
            console.log(err);
            NotificationManager.error("Failed");
            this.setState({ isLoading: false });
        }
    }
    
    getAllPhotos = async () => {
        
        const { PhotoMarketplace, activeCategory } = this.state;
        this.setState({
            itemLoading: true
        })
        const folderList = await PhotoMarketplace.methods.getFolderList().call();
        let mainList = [];
        folderList.map(async(item, idx) => {
            item.folderIndex = idx;
        })

        for await (let item of folderList) {
            const res = await PhotoMarketplace.methods.getPhoto(item.wide[0]).call();
            try {
                const response = await fetch(`${res.nftData.tokenURI}`);
                if(response.ok) {
                    const json = await response.json();
                    mainList.push({ ...item, ...json });
                }
            } catch (err) { }
        }

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

    init = async () => {
    
      let PhotoNFT = {};
      let PhotoMarketplace = {};
      try {
          PhotoNFT = require("../../abi/PhotoNFT.json");
          PhotoMarketplace = require("../../abi/PhotoMarketplace.json");
          
          //console.log(marketplace_addr, PhotoMarketplace);
      } catch (e) {
          console.log(e);
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
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
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
          if (error) {
            console.log(error)
            this.setState({
                itemLoading: false
            })
          }
      }
    };

    async componentDidMount() {
        await this.init();
    }

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

    faliedLoadImage = (e) => {
        e.target.src="/img/empty.png";
    }

    render() {
        const { allPhotos, isLoading, itemLoading } = this.state;

        return (
            <>
                { isLoading && <ScreenLoading/> }
                <Breadcrumb img="marketplace"/>
                <div className="explore-area">
                    <div className="row justify-content-center text-center mt-3">
                        <div className="col-12">
                            {/* Explore Menu */}
                            <div className="explore-menu btn-group btn-group-toggle flex-wrap justify-content-center text-center mb-4" data-toggle="buttons">
                                <label
                                    className="btn active d-table text-uppercase p-2 category-btn border-radius"
                                    onClick={() => this.setState({ activeCategory: "all" })}
                                >
                                    <input type="radio" defaultValue="all" defaultChecked className="explore-btn" />
                                    <span>ALL</span>
                                </label>
                                <label
                                    className="btn d-table text-uppercase p-2 ml-2 category-btn border-radius"
                                    onClick={() => this.setState({ activeCategory: "physical" })}
                                >
                                    <input type="radio" defaultValue="physical" className="explore-btn" />
                                    <span>PHYSICAL ASSETS</span>
                                </label>
                                <label
                                    className="btn d-table text-uppercase p-2 ml-2 category-btn border-radius"
                                    onClick={() => this.setState({ activeCategory: "digital" })}
                                >
                                    <input type="radio" defaultValue="digital" className="explore-btn" />
                                    <span>DIGITAL ASSETS</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    { itemLoading && <ItemLoading/> }
                    {
                        !itemLoading &&
                        <div className="row items">
                            {allPhotos.map((item, inx) => {
                                return (
                                    <div className="col-12 col-sm-6 col-lg-3 item" key={inx} data-groups={item.category}>
                                        <div className="card">
                                            <div className="image-over">
                                            <img className="card-img-top" src={`${item.image}`} alt="" onError={this.faliedLoadImage} />
                                            </div>
                                            {/* Card Caption */}
                                            <div className="card-caption p-0 text-center">
                                                {/* Card Body */}
                                                <div className="card-body">
                                                    <div className="card-bottom d-flex justify-content-center">
                                                        <span className="pb-2">{item.folder}</span>
                                                    </div>
                                                    <a
                                                        href={`/folder-item/${item.folderIndex}`}
                                                        size={'medium'}
                                                        width={1}
                                                        className="btn w-100"
                                                    > View Available NFT Collection </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {
                                !allPhotos.length && !itemLoading && <h4 className="text-center text-muted">No items.</h4>
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

export default connect(mapToStateProps, null)(PhotoMarketplace);