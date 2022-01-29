import React, {  useEffect, useState, Fragment } from "react";
import { createGlobalStyle } from 'styled-components';
import getWeb3 from "../../utils/getWeb3";

const GlobalStyles  = createGlobalStyle`
`;

const folderNFTs = (props) => {
    const [web3, setWeb3] = useState(null);
    const [NFT, setNFT] = useState(null);
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restGradList, setRestGradList] = useState([]);
    const [height, setHeight] = useState(0);
    const [folderName, setFolderName] = useState('');

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
        const { id } = props;
        let gradList = await Marketplace.methods.getSubFolderItem(id).call();
        let list = gradList;
        setFolderName(gradList.folder);
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
                const response = await fetch(`${item.nftData.tokenURI}`);
                if(response.ok) {
                    const json = await response.json();
                    mainList.push({ ...item, ...json });
                }
            } catch (err) { }
        }
        
        // console.log(folderList);
        setNFTLists(mainList);
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
                    {/* { nfts.length !== this.dummyData.length &&
                        <div className='col-lg-12'>
                            <div className="spacer-single"></div>
                            <span onClick={() => this.loadMore()} className="btn-main lead m-auto">Load More</span>
                        </div>
                    } */}
                </div>
            </section>
        </div>

    );
}

export default folderNFTs;