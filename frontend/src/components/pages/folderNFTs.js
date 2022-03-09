import React, {  lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import Empty from "../components/Empty";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from 'styled-components';
import Loading from "../components/Loading/Loading";


const TradeNFT = lazy(() => import("../components/FolderNFT/tradeNFT"));
const PremiumNFTLoading = lazy(() => import("../components/Loading/PremiumNFTLoading"));

const GlobalStyles = createGlobalStyle`
    .btn-apply {
        background: #3fb737;
    }

    .btn-apply:hover {
        box-shadow: 2px 2px 20px 0px #3fb737;
    }
    
    .groups {
        display: grid;
        grid-template-columns: auto auto;
        column-gap: 15px;
    }

    .owner-check {
        position: absolute;
        right: 15px;
        top: 15px;
        font-size: 25px !important;
        color: turquoise;
    }

    .bid-check {
        position: absolute;
        right: 15px;
        bottom: 15px;
        font-size: 25px !important;
        color: turquoise;
        width: 25px;
        height: 25px;
    }

    .wap-height {
        height: calc(100% - 120px);
    }

`;

const folderNFTs = () => {

    const params = useParams();
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restList, setRestList] = useState([]);
    const [folderName, setFolderName] = useState("Collection");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(async () => {
        if (!isLoading) {
            await fetchNFT();
        }
    },[isLoading])
    useEffect(async() => {
        const { instanceMarketplace } = await getWeb3();
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
        let oldList = gradList[0];
        let list = [...oldList];
        list.sort(function(a, b) {
            let premiumA = a.marketData.premiumStatus;
            let premiumB = b.marketData.premiumStatus;
            if (premiumA && !premiumB) return -1;
            else if (!premiumA && premiumB) return 0;
            else return 1;
        });

        setFolderName(gradList[1]);
        setRestList(list);
        setIsLoading(false);
    }

    const fetchNFT = async () => {
        let list = restList;
        if (list.length > 8) {
            list = list.slice(0,8);
            setRestList(restList.slice(8, restList.length));
        } else setRestList([]);
        
        setNFTLists([...nfts, ...list]);
    }

    return (
        <div>
            <GlobalStyles/>
            <Suspense fallback={<Loading/>}>
                <section className='jumbotron breadcumb no-bg'>
                    <div className='mainbreadcumb'>
                        <div className='container'>
                            <div className='row m-10-hor'>
                            <div className='col-12'>
                                <h1 className='text-center'>{folderName}</h1>
                            </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='container'>
                    {
                        isLoading && <PremiumNFTLoading/>
                    }
                    {
                        !isLoading &&  (
                            <InfiniteScroll
                                dataLength={nfts.length}
                                next={fetchNFT}
                                hasMore={restList.length ? true : false}
                                loader={<PremiumNFTLoading/>}
                                className="row"
                            >
                                {
                                    nfts.map( (nft, index) => {
                                        return (
                                            <TradeNFT data={nft} key={index}/>
                                        )
                                    })
                                }
                            </InfiniteScroll>)
                    }
                    {
                        !isLoading && !nfts.length && <Empty/>
                    }
                    
                </section>
            </Suspense>
        </div>

    );
}

export default folderNFTs;