import React, {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import getWeb3 from "../../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { useSelector } from "react-redux";
import Select from 'react-select';
import { filterDropdown } from "../../../config/styles.js";
import { createGlobalStyle } from "styled-components";
import TradeNFT from "../../components/FolderNFT/tradeNFT";
import PremiumNFTLoading from "../../components/Loading/PremiumNFTLoading";
import Empty from "../../components/Empty";
import style from "./style.js";
import { failedLoadImage } from "../../../utils/compre.js";

const GlobalStyle = createGlobalStyle`${style}`;

const filters = [
    {
        label: "All",
        value: false
    },
    {
        label: "For Sale",
        value: true
    }
];

const sale_filters = [
    {
        label: "Highest",
        value: -1
    },
    {
        label: "Lowest",
        value: 1
    }
];


const FolderNFTs = () => {

    const params = useParams();
    const navigate = useNavigate();
    
    const initialUser = useSelector(({ auth }) => auth.user);
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restList, setRestList] = useState([]);
    const [artist, setArtist] = useState();
    const [description, setDescription] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(filters[0]);
    const [priceSort, setPriceActiveCategory] = useState(sale_filters[0]);

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
            setIsLoading(true);
            setNFTLists([]);
            setRestList([]);
            await getInitNFTs();
        }
    },[Marketplace, activeCategory, priceSort])

    const getInitNFTs = async() => {
        const { id } = params;
        let gradList = await axios.post(
            `${process.env.REACT_APP_BACKEND}folder/get-folder-detail`,
            {
                folderID: id,
                user: initialUser?.username ? initialUser.username : "",
                isSale: activeCategory.value,
                sort: priceSort.value
            }).then(res => {
            let { list, artist: _artist, description: _desc } = res.data;
            setArtist(_artist);
            setDescription(_desc);
            if (activeCategory.value) {
                // list = list.filter(item => item.action == "list" || item.action == "auction");
                console.log(list);
                // list.sort((start, end) => {
                //     if (!priceSort.value) return Number(start.price) - Number(end.price);
                //     return Number(end.price) - Number(start.price);
                // });
            }
            return list;
        }).catch(err => {
            navigate('/404');
        })

        setRestList(gradList);
        setIsLoading(false);
    }

    const fetchNFT = async () => {
        let list = restList;
        if (list.length > 48) {
            list = list.slice(0,48);
            setRestList(restList.slice(48, restList.length));
        } else setRestList([]);
        
        setNFTLists([...nfts, ...list]);
    }

    return (
        <>
            <GlobalStyle/>
            <section className='jumbotron breadcumb no-bg'>
                <div className='mainbreadcumb'>
                    <div className='container'>
                        <div className='row m-10-hor'>
                        <div className='col-12'>
                            {
                                isLoading ? <Skeleton/>
                                : (
                                    artist ?
                                    <div className="d-flex align-items-center justify-content-center flex-column profile_avatar">
                                        <img src={`${process.env.REACT_APP_BACKEND}avatar/${artist?.avatar}`} alt="artist" onError={failedLoadImage} className="rounded-circle mx-150px ratio-1-1" crossOrigin="true"/>
                                        <h1 className="text-center">{artist.name}</h1>
                                        <p className="text-center">{description}</p>
                                    </div>
                                    : <div className="d-flex align-items-center justify-content-center flex-column profile_avatar">
                                        <img src="/img/empty.jfif" alt="artist" className="rounded-circle mx-150px ratio-1-1" onError={failedLoadImage} />
                                    </div>
                                )
                            }
                        </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className='container'>
                <div className="d-flex align-items-center justify-content-end w-100 gap-3 mb-3">
                    <div>
                        <span className="fs-6">Filter:</span>
                    </div>
                    <div className='dropdownSelect one'>
                        <Select
                            className='select1'
                            styles={filterDropdown}
                            menuContainerStyle={{'zIndex': 999}}
                            value={activeCategory}
                            options={filters}
                            onChange={(value) => {
                                setActiveCategory(value);
                                // setFolderList([]);
                            }}
                            
                        />
                    </div>

                    <div className='dropdownSelect one'>
                        <Select
                            className='select1'
                            styles={filterDropdown}
                            menuContainerStyle={{'zIndex': 999}}
                            value={priceSort}
                            options={sale_filters}
                            onChange={(value) => {
                                if (activeCategory.value) setPriceActiveCategory(value);
                                else return null;
                            }}
                            disabled
                        />
                    </div>

                </div>
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

    );
}

export default FolderNFTs;