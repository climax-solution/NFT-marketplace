import React, {  lazy, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import Empty from "../components/Empty";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from 'styled-components';
import Skeleton from "react-loading-skeleton";
import axios from "axios";


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
`;

const folderNFTs = () => {

    const params = useParams();
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restList, setRestList] = useState([]);
    const [artist, setArtist] = useState();
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
        let gradList = await axios.post('http://localhost:7060/folder/get-folder-detail', { folderID: id}).then(res => {
            let { list, artist: _artist } = res.data;
            setArtist(_artist);
            return list;
        }).catch(err => {

        })
        // gradList.sort(function(a, b) {
        //     let premiumA = a.status;
        //     let premiumB = b.status;
        //     if (premiumA && !premiumB) return -1;
        //     else if (!premiumA && premiumB) return 0;
        //     else return 1;
        // });

        // setFolderName(gradList[1]);
        setRestList(gradList);
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
            <>
                <section className='jumbotron breadcumb no-bg'>
                    <div className='mainbreadcumb'>
                        <div className='container'>
                            <div className='row m-10-hor'>
                            <div className='col-12'>
                                {
                                    isLoading ? <Skeleton/>
                                    : (
                                        <div className="text-center">
                                            <img src={`http://localhost:7060/avatar/${artist.avatar}`} alt="artist" className="rounded-circle" crossOrigin="true"/>
                                            <h1 className="text-center">{artist.firstName + " " + artist.lastName}</h1>
                                        </div>
                                    )
                                }
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
                                            <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4 position-relative" key={index}>
                                                <TradeNFT data={nft}/>
                                            </div>
                                        )
                                    })
                                }
                            </InfiniteScroll>)
                    }
                    {
                        !isLoading && !nfts.length && <Empty/>
                    }
                    
                </section>
            </>
        </div>

    );
}

export default folderNFTs;