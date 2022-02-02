import axios from "axios";
import React, {  useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createGlobalStyle } from 'styled-components';
import getWeb3 from "../../utils/getWeb3";
import Empty from "../components/Empty";
import Loading from "../components/Loading";

const GlobalStyles  = createGlobalStyle`
`;

const folderNFTs = (props) => {
    const params = useParams();
    const [web3, setWeb3] = useState(null);
    const [NFT, setNFT] = useState(null);
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restGradList, setRestGradList] = useState([]);
    const [height, setHeight] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(async() => {
        const { _web3, instanceNFT, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setNFT(instanceNFT);
        setMarketplace(instanceMarketplace);
    },[])

    useEffect(async() => {
        if (Marketplace) {
            await getInitNFTs();
        }
    },[Marketplace])

    const getInitNFTs = async() => {
        const { id } = params;
        let gradList = await Marketplace.methods.getSubFolderItem(id).call();
        let list = gradList;
        if (gradList.length > 8) {
            list = gradList.slice(0,8);
            setRestGradList(gradList.slice((gradList.length - 8) * -1));
        }
        await getNFTs(list);
    }

    const getNFTs = async (list) => {
        let mainList = [];
        for await (let item of list) {
            try {
                const { data } = await axios.get(`${item.nftData.tokenURI}`);
                mainList.push({ ...item, ...data });
            } catch (err) { }
        }
        
        console.log(mainList);
        setNFTLists(mainList);
        setIsLoading(false);
    }

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }

    const faliedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <div>
            <section className='jumbotron breadcumb no-bg'>
                <div className='mainbreadcumb'>
                    <div className='container'>
                        <div className='row m-10-hor'>
                        <div className='col-12'>
                            <h1 className='text-center'>Collection</h1>
                        </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className='container'>
                {
                    isLoading && <Loading/>
                }

                {
                    !isLoading && (
                        <div className='row'>
                            {nfts.map( (nft, index) => (
                                <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                                    <div className="nft__item m-0 pb-4">
                                        <div className="nft__item_wrap" style={{height: `${height}px`}}>
                                            <span>
                                                <img onLoad={onImgLoad} src={nft.image} onError={faliedLoadImage} className="lazy nft__item_preview" alt=""/>
                                            </span>
                                        </div>
                                        <div className="nft__item_info mb-0">
                                            <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                                <h4>{nft.nftName}</h4>
                                            </span>
                                            <div className="nft__item_price">
                                                {web3.utils.fromWei(nft.marketData.price, 'ether')}<span>BNB</span>
                                            </div>                       
                                        </div> 
                                    </div>
                                </div>  
                            ))}
                            {
                                !nfts.length && <Empty/>
                            }
                        </div>
                    )
                }
            </section>
        </div>

    );
}

export default folderNFTs;