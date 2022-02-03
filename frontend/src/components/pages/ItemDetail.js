import React, { useEffect, useState } from "react";
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import axios from "axios";
import Empty from "../components/Empty";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;
const Colection= function() {

    const params = useParams();
    const [web3, setWeb3] = useState(null);
    const [NFT, setNFT] = useState(null);
    const [Marketplace, setMarketplace] = useState(null);
    const [openMenu, setOpenMenu] = React.useState(true);
    const [openMenu1, setOpenMenu1] = React.useState(false);
    const [nftData, setNFTData] = useState({});

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
            const item = await Marketplace.methods.getPhoto(id).call();
            console.log(item);
            await axios.get(item.nftData.tokenURI).then(res => {
                const { data } = res;
                setNFTData({ ...item, ...data});
            })
        } catch(err) {
            setNFTData({});
        }
    },[Marketplace])

    const handleBtnClick = () => {
        setOpenMenu(!openMenu);
        setOpenMenu1(false);
        document.getElementById("Mainbtn").classList.add("active");
        document.getElementById("Mainbtn1").classList.remove("active");
    };
    const handleBtnClick1 = () => {
        setOpenMenu1(!openMenu1);
        setOpenMenu(false);
        document.getElementById("Mainbtn1").classList.add("active");
        document.getElementById("Mainbtn").classList.remove("active");
    };
    console.log("nftData", nftData);
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
                Object.keys(nftData).length ?
                <section className='container'>
                    <div className='row mt-md-5 pt-md-4'>

                    <div className="col-md-6 text-center">
                        <img src={nftData.image} className="img-fluid img-rounded mb-sm-30" alt=""/>
                    </div>
                    <div className="col-md-6">
                        <div className="item_info">
                            Auctions ends in 
                            <div className="de_countdown">
                                <Clock deadline="December, 30, 2021" />
                            </div>
                            <h2>{nftData.nftName}</h2>
                            <div className="item_info_counts">
                                <div className="item_info_type"><i className="fa fa-image"></i>{nftData.category}</div>
                                <div className="item_info_views"><i className="fa fa-eye"></i>250</div>
                                <div className="item_info_like"><i className="fa fa-heart"></i>18</div>
                            </div>
                            <p>{nftData.nftDesc}</p>

                            <div className="spacer-40"></div>

                            <div className="de_tab">

                            <ul className="de_nav">
                                <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>Bids</span></li>
                                <li id='Mainbtn1' className=''><span onClick={handleBtnClick1}>History</span></li>
                            </ul>
                            
                            <div className="de_tab_content">
                                {openMenu && (  
                                <div className="tab-1 onStep fadeIn">
                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-1.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid accepted <b>0.005 ETH</b>
                                            <span>by <b>Monica Lucas</b> at 6/15/2021, 3:20 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-2.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.005 ETH</b>
                                            <span>by <b>Mamie Barnett</b> at 6/14/2021, 5:40 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-3.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.004 ETH</b>
                                            <span>by <b>Nicholas Daniels</b> at 6/13/2021, 5:03 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-4.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.003 ETH</b>
                                            <span>by <b>Lori Hart</b> at 6/12/2021, 12:57 AM</span>
                                        </div>
                                    </div>
                                </div>
                                )}

                                {openMenu1 && ( 
                                <div className="tab-2 onStep fadeIn">
                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-5.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.005 ETH</b>
                                            <span>by <b>Jimmy Wright</b> at 6/14/2021, 6:40 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-1.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid accepted <b>0.005 ETH</b>
                                            <span>by <b>Monica Lucas</b> at 6/15/2021, 3:20 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-2.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.005 ETH</b>
                                            <span>by <b>Mamie Barnett</b> at 6/14/2021, 5:40 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-3.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.004 ETH</b>
                                            <span>by <b>Nicholas Daniels</b> at 6/13/2021, 5:03 AM</span>
                                        </div>
                                    </div>

                                    <div className="p_list">
                                        <div className="p_list_pp">
                                            <span>
                                                <img className="lazy" src="./img/author/author-4.jpg" alt=""/>
                                                <i className="fa fa-check"></i>
                                            </span>
                                        </div>                                    
                                        <div className="p_list_info">
                                            Bid <b>0.003 ETH</b>
                                            <span>by <b>Lori Hart</b> at 6/12/2021, 12:57 AM</span>
                                        </div>
                                    </div>
                                </div>
                                )}
                                
                            </div>
                            
                        </div>
                            
                        </div>
                    </div>

                    </div>
                </section>
                : !Object.keys(nftData).length && <Empty/>
            }
            <Footer />
        </div>
    );
}
export default Colection;