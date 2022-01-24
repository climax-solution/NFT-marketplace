import React, { Component } from "react";
import { Button } from 'rimble-ui';
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import getWeb3 from "../../utils/getWeb3";
import '../../App.module.scss';
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
          folderData: [],
          restGradList: []
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
            NotificationManager.success("Success");
            await this.getInitNFTs();
            this.setState({ isLoading: false });
        } catch(err) {
            console.log(err);
            NotificationManager.error("Failed");
            this.setState({ isLoading: false });
        }
    }
    
    getAllPhotos = async (folderList) => {
        const { allPhotos } = this.state;
        let mainList = [];
        for await (let item of folderList) {
            try {
                const response = await fetch(`${item.nftData.tokenURI}`);
                if(response.ok) {
                    const json = await response.json();
                    mainList.push({ ...item, ...json });
                }
            } catch (err) { }
        }
        
        // console.log(folderList);
        this.setState({
            allPhotos: allPhotos.concat(mainList) ,
            itemLoading: false
        })
    }

    async fetchMore() {
        const { restGradList } = this.state;
        let list = restGradList;
        if (restGradList.length > 8) {
            list = restGradList.slice(0, 8);
            this.setState({
                restGradList: restGradList.slice((restGradList.length - 8) * -1)
            })
        }
        
        else  {
            this.setState({
                restGradList: []
            })
        }

        await this.getAllPhotos(list);

    }

    init = async () => {
    
      let PhotoNFT = {};
      let PhotoMarketplace = {};
      try {
          PhotoNFT = require("../../abi/PhotoNFT.json");
          PhotoMarketplace = require("../../abi/PhotoMarketplace.json");
      } catch (e) {
          ////console.log(e);
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
                    PhotoMarketplace: instancePhotoMarketplace,
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

        if (navigator.onLine) await this.getInitNFTs();
        else this.setState({ isLoading: false });
      } catch (error) {
        if (error) {
            console.log(error);
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

    async componentDidUpdate(preprops) {
        const { connected } = this.props;
        if (preprops != this.props) {
            await this.init();
            const { web3 } = this.state;
            this.setState({
                isMetaMask: connected
            })
            const accounts = await web3.eth.getAccounts();
            this.setState({
                currentAccount: connected ? accounts[0] : ''
            })
        }
    }

    async getInitNFTs() {
        const { PhotoMarketplace } = this.state;
        const { id } = this.props.match.params;
        let gradList = await PhotoMarketplace.methods.getSubFolderItem(id).call();
        let list = gradList;
        this.setState({
            allPhotos: []
        });
        if (gradList.length > 8) {
            list = gradList.slice(0,8);
            this.setState({
                restGradList: gradList.slice((gradList.length - 8) * -1)
            })
        }
        await this.getAllPhotos(list);

    }

    faliedLoadImage = (e) => {
        e.target.src="/img/empty.png";
    }
    
    render() {
        const { web3, allPhotos, currentAccount, isMetaMask, isLoading, itemLoading, restGradList } = this.state;
        
        let premiumNFT, normalNFT;
        let isExist = true;
        if (isMetaMask) {
          premiumNFT = allPhotos.filter(item => item.marketData.premiumStatus );
          normalNFT = allPhotos.filter(item => !item.marketData.premiumStatus );
          if (premiumNFT.length + normalNFT.length == 0) isExist = false;
        }
        else {
          premiumNFT = allPhotos.filter(item => item.marketData.premiumStatus );
          normalNFT = allPhotos.filter(item => !item.marketData.premiumStatus);
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
                        <>
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
                                                            <span>{ItemPrice} BNB</span>
                                                        </div>
                                                        {
                                                            item.marketData.marketStatus && item.nftData.owner != currentAccount &&
                                                            <Button
                                                                size={'medium'}
                                                                width={1}
                                                                onClick={() => this.buyPhotoNFT(item.nftData.tokenID)}
                                                                className="btn"
                                                            > Buy </Button>
                                                        }
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
                                                <a href={`/item-details/${item.nftData.tokenID}`}><img className="card-img-top" onError={this.faliedLoadImage} src={`${item.image}`} alt="" /></a>
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
                                                            <span>{item.nftName || item.nftname}</span>
                                                            <span>{ItemPrice} BNB</span>
                                                        </div>
                                                        {
                                                            item.marketData.marketStatus && item.nftData.owner != currentAccount &&
                                                            <Button
                                                                size={'medium'}
                                                                width={1}
                                                                onClick={() => this.buyPhotoNFT(item.nftData.tokenID)}
                                                                className="btn"
                                                            > Buy </Button>
                                                        }
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
                            {
                                restGradList.length ? 
                                <div className="row">
                                    <div className="col-12 text-center">
                                        <a id="load-btn" className="btn btn-bordered-white mt-5" onClick={() => this.fetchMore()}>Load More</a>
                                    </div>
                                </div>
                                : <></>
                            }
                        </>
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