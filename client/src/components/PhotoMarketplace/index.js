import React, { Component } from "react";
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import getWeb3 from "../../utils/getWeb3";
import '../../App.module.scss';
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import ScreenLoading from "../Loading/screenLoading";
import ItemLoading  from "../Loading/itemLoading";
import addresses from "../../config/address.json";
import axios from "axios";
import "./custom.css";

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
          folderData: [],
          restGradList: [],
          search: '',
          tmpWord: ''
        };

    }

    getAllPhotos = async (folderList) => {
        
        const { PhotoNFT, allPhotos } = this.state;
        let mainList = [];

        for await (let item of folderList) {
            const URI = await PhotoNFT.methods.tokenURI(item.wide[0]).call();
            try {
                const res = await axios.get(`${URI}`);
                mainList.push({ ...item, ...res.data });
            } catch (err) { }
        }

        this.setState({
            allPhotos: allPhotos.concat(mainList),
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
        if (navigator.onLine){
            let gradList = await instancePhotoMarketplace.methods.getFolderList().call();
            let idx = 0;
            for await (let item of gradList) {
                item.folderIndex = idx;
                idx ++;
            }
            let list = gradList;
            if (gradList.length > 8) {
                list = gradList.slice(0,8);
                this.setState({
                    restGradList: gradList.slice((gradList.length - 8) * -1)
                })
            }
            await this.getAllPhotos(list);
        }
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
      const { web3, activeCategory, PhotoMarketplace, search } = this.state;
      if (preprops != this.props || prevState.activeCategory != activeCategory) {
        this.setState({
          isMetaMask: this.props.connected,
        })
        if (web3 != null) {

            this.setState({
                itemLoading: true
            })

            let gradList = await PhotoMarketplace.methods.getFolderList().call();
            let idx = 0;

            for await (let item of gradList) {
                item.folderIndex = idx;
                idx ++;
            }

            if (prevState.activeCategory != activeCategory && activeCategory) {
                gradList = gradList.filter(item => item.category == activeCategory);
            }

            if (search) gradList = gradList.filter(item => ((item.folder).toLowerCase()).search(search.toLowerCase()) > -1);

            let list = gradList;
            
            if (gradList.length > 8) {
                list = gradList.slice(0,8);
                this.setState({
                    restGradList: gradList.slice((gradList.length - 8) * -1)
                })
            }
            this.setState({
                allPhotos: []
            });

            await this.getAllPhotos(list);
        }
      }
    }

    faliedLoadImage = (e) => {
        e.target.src="/img/empty.png";
    }

    async searchCollection() {
        const { PhotoMarketplace, tmpWord, activeCategory } = this.state;
        try {
            this.setState({
                itemLoading: true,
                allPhotos: [],
                search: tmpWord
            });

            let gradList = await PhotoMarketplace.methods.getFolderList().call();
            let idx = 0;

            for await (let item of gradList) {
                item.folderIndex = idx;
                idx ++;
            }

            if (tmpWord.length) gradList = gradList.filter(item => ((item.folder).toLowerCase()).search(tmpWord.toLowerCase()) > -1);
            if (activeCategory) gradList = gradList.filter(item => item.category == activeCategory);
            let list = gradList;
            if (gradList.length > 8) {
                list = gradList.slice(0, 8);
                this.setState({
                    restGradList: gradList.slice((gradList.length - 8) * -1)
                })
            }
            
            else  {
                this.setState({
                    restGradList: []
                })
            }

            await this.getAllPhotos(list);
        } catch(err) {
            console.log(err);
            this.setState({
                itemLoading: false
            })
        }
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

    render() {
        const { allPhotos, isLoading, itemLoading, restGradList, tmpWord } = this.state;

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
                                    onClick={() => this.setState({ activeCategory: "" })}
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
                    <div className="row justify-content-between search-box align-items-center">
                        <div className="form-group search-input mb-0">
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                placeholder="Enter collection name"
                                required="required"
                                value={tmpWord}
                                onChange={(e) => this.setState({ tmpWord: e.target.value }) }
                            />
                        </div>
                        <div className="w-150">
                            <button className="btn" type="button" onClick={() => !itemLoading ? this.searchCollection() : null}>Search</button>
                        </div>
                    </div>
                    { itemLoading && <ItemLoading/> }
                    {
                        !itemLoading &&
                        <>
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

export default connect(mapToStateProps, null)(PhotoMarketplace);