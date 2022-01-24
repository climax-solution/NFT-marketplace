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

export default class Collections extends Component {
    
    constructor(props) {    
        super(props);
        this.state = {
          web3: null,
          isLoading: false,
          itemLoading: true,
          PhotoMarketplace: {},
          PhotoNFT: {},
          activeCategory: null,
          collections: [],
          restGradList: [],
          search: ""
        };

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
          if (navigator.onLine) {
            let gradList = await instancePhotoMarketplace.methods.getFolderList().call();
            let list = gradList;
            if (gradList.length > 8) {
                list = gradList.slice(0,8);
                this.setState({
                    restGradList: gradList.slice((gradList.length - 8) * -1)
                })
            }
            await this.fetchCollections(list);
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

    async fetchCollections (list) {
        const { PhotoNFT, collections } = this.state;
        let gradList = list;
        let initList = [];
        for await (let item of gradList) {
            const res = await PhotoNFT.methods.tokenURI(item.wide[0]).call();
            const { folder } = item;
            try {
                const _item = await axios.get(res);
                _item.data.folder = folder;
                initList.push(_item.data);
            } catch(err) {

            }
        }

        this.setState({
            collections: collections.concat(initList) ,
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

        this.fetchCollections(list);

    }

    async searchCollection() {
        const { PhotoMarketplace, search } = this.state;
        console.log(search);
        try {
            this.setState({
                itemLoading: true,
                collections: []
            });
            let gradList = await PhotoMarketplace.methods.getFolderList().call();
            if (search.length) gradList = gradList.filter(item => item.folder.indexOf(search) > 0);
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

            await this.fetchCollections(list);
        } catch(err) {
            this.setState({
                itemLoading: false
            })
        }
    }

    render() {
        const  { itemLoading, collections, restGradList, search } = this.state;
        return (
            <>
                <Breadcrumb img="marketplace"/>
                <div className="row justify-content-between search-box align-items-center mt-3">
                    <div className="form-group search-input mb-0">
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Enter collection name"
                            required="required"
                            value={search}
                            onChange={(e) => this.setState({ search: e.target.value }) }
                        />
                    </div>
                    <div className="w-150">
                        <button className="btn" type="button" onClick={() =>this.searchCollection()}>Search</button>
                    </div>
                </div>
                { itemLoading && <ItemLoading/> }
                {
                    !itemLoading &&
                    <>
                        
                        <div className="row items">
                            {
                                collections.map((item, inx) => {
                                    return (
                                        <div className="col-12 col-sm-6 col-lg-3 item" key={inx}>
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
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            {
                                !collections.length && !itemLoading && <h4 className="text-center text-muted">No items.</h4>
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
            </>
        )
    }
}