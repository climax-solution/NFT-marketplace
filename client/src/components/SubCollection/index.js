import React, { Component } from "react";
import { connect } from "react-redux";
import getWeb3 from "../../utils/getWeb3";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import ItemLoading  from "../Loading/itemLoading";
import addresses from "../../config/address.json";

const { marketplace_addr, nft_addr } = addresses;

class SubCollection extends Component {
    constructor(props) {    
        super(props);
        this.state = {
          web3: null,
          accounts: null,
          currentAccount: null,          
          allPhotos: [],
          isLoading: false,
          itemLoading: true,
          isMetaMask: false,
          PhotoMarketplace: {},
          PhotoNFT: {},
          activeCategory: null,
          folderData: [],
          restGradList: []
        };
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
        const { allPhotos, itemLoading, restGradList } = this.state;
        
        return (
            <>
                <Breadcrumb img="marketplace"/>
                <div className="explore-area">
                    { itemLoading && <ItemLoading/> }
                    {
                        !itemLoading &&
                        <>
                            <div className="row items" style={{minHeight: '300px'}}>
                                {allPhotos.map((item, idx) => {
                                    return (
                                        <div className="col-12 col-sm-6 col-lg-3 item" key={idx} data-groups={item.category}>
                                            <div className="card">
                                                <div className="image-over position-relative">
                                                    <img className="card-img-top" src={`${item.image}`} alt="" />
                                                </div>
                                                {/* Card Caption */}
                                                <div className="card-caption p-0">
                                                    {/* Card Body */}
                                                    <div className="card-body">
                                                        <div className="card-bottom d-flex justify-content-between">
                                                            <span>{item.nftName || item.nftname }</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {
                                    !allPhotos.length && <h4 className="text-center text-muted">No items.</h4>
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

export default connect(mapToStateProps, null)(SubCollection);