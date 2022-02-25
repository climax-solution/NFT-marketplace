import React, { useEffect, useState } from "react";
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import axios from "axios";
import Empty from "../components/Empty";
import ItemDetailsLoading from "../components/Loading/ItemDetailsLoading";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
  .border-grey {
      border-color: #4e4e4e !important;
  }
`;
const Colection = function() {

    const params = useParams();
    const [web3, setWeb3] = useState(null);
    const [NFT, setNFT] = useState(null);
    const [Marketplace, setMarketplace] = useState(null);
    const [openMenu, setOpenMenu] = React.useState(true);
    const [openMenu1, setOpenMenu1] = React.useState(false);
    const [nftData, setNFTData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(async() => {
        const { _web3, instanceNFT, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setNFT(instanceNFT);
        setMarketplace(instanceMarketplace);
    },[])

    useEffect(async() => {
        if (!Marketplace) return;
        try {
            const { id } = params;
            const item = await Marketplace.methods.getItemNFT(id).call();
            await axios.get(item.nftData.tokenURI).then(async(res) => {
                const { data } = res;
                let likes = { liked: 0};
                await axios.post("http://nftdevelopments.co.nz/activity/get-likes", {tokenID: id, walletAddress: '' }).then(res => {
                    likes = res.data;
                }).catch(err => {})
                setNFTData({ ...item, ...data, ...likes });
            }).catch(err => {

            })
        } catch(err) {
            console.log(err);
            setNFTData({});
        }
        setLoading(false);
    },[Marketplace])
    
    return (
        <div>
            <GlobalStyles/>
            <section className='jumbotron breadcumb no-bg'>
                <div className='mainbreadcumb'>
                    <div className='container'>
                        <div className='row m-10-hor'>
                        <div className='col-12'>
                            <h1 className='text-center'>Item Details</h1>
                        </div>
                        </div>
                    </div>
                </div>
            </section>
            {
                loading && <ItemDetailsLoading/>
            }
            {
                !loading && (
                    Object.keys(nftData).length ?
                        <section className='container'>
                            <div className='row mt-md-5 pt-md-4'>

                            <div className="col-md-6 text-center">
                                <img src={nftData.image} className="img-fluid img-rounded mb-sm-30" alt=""/>
                            </div>
                            <div className="col-md-6">
                                <div className="item_info">
                                    {
                                        nftData.auctionData.existance && (
                                            <>
                                                Auctions ends in 
                                                <div className="de_countdown">
                                                    <Clock deadline={nftData.auctionData.endAuction * 1000} />
                                                </div>
                                            </>
                                        )
                                    }
                                    <h2>{nftData.nftName}</h2>
                                    <div className="item_info_counts">
                                        <div className="item_info_type"><i className="fa fa-image"></i>{nftData.category}</div>
                                        <div className="item_info_like"><i className="fa fa-heart"></i>{nftData.liked}</div>
                                    </div>
                                    <p>{nftData.nftDesc}</p>

                                    <div className="spacer-40"></div>
                                    <h4>Attributes</h4>
                                    <div className="row">
                                        {
                                            nftData.attributes.map((item, index) => {
                                                return (
                                                    <div className="col-md-6 col-12 mb-3" key={index}>
                                                        <div className="border p-5 h-100 border-grey rounded">
                                                            <h5 className="text-center">{item.trait_type}</h5>
                                                            <p className="text-center">{item.value}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>

                            </div>
                        </section>
                    : !Object.keys(nftData).length && <Empty/>
                )
            }
            <Footer />
        </div>
    );
}
export default Colection;