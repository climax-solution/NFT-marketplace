import React, {  lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import Empty from "../components/Empty";
import Loading from "../components/Loading/Loading";
import InfiniteScroll from "react-infinite-scroll-component";

const TradeNFT = lazy(() => import("../components/FolderNFT/tradeNFT"));

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
            if (premiumA && !premiumB) return 1;
            else if (!premiumA && premiumB) return -1;
            else return 0;
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
                        isLoading && <Loading/>
                    }

                    {
                        !isLoading &&  (
                            <InfiniteScroll
                                dataLength={nfts.length}
                                next={fetchNFT}
                                hasMore={restList.length ? true : false}
                                loader={<Loading/>}
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