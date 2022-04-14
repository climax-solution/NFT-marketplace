import React, {  lazy, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from 'styled-components';
import Skeleton from "react-loading-skeleton";
import axios from "axios";

const TradeNFT = lazy(() => import("../components/FolderNFT/tradeNFT"));
const PremiumNFTLoading = lazy(() => import("../components/Loading/PremiumNFTLoading"));
const Empty = lazy(() => import("../components/Empty"));

const GlobalStyles = createGlobalStyle`
    
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
    const [description, setDescription] = useState();
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
        let gradList = await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-detail`, { folderID: id}).then(res => {
            let { list, artist: _artist, description: _desc } = res.data;
            setArtist(_artist);
            setDescription(_desc);
            return list;
        }).catch(err => {

        })

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
                                        <div className="d-flex align-items-center justify-content-center flex-column profile_avatar">
                                            <img src={`${process.env.REACT_APP_BACKEND}avatar/${artist.avatar}`} alt="artist" className="rounded-circle mx-150px ratio-1-1" crossOrigin="true"/>
                                            <h1 className="text-center">{artist.name}</h1>
                                            <p className="text-center">{description}</p>
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
                                            <TradeNFT data={nft} key={index}/>
                                        )
                                    })
                                }
                            </InfiniteScroll>
                        )
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