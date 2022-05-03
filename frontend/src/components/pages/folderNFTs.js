import React, {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import getWeb3 from "../../utils/getWeb3";
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from 'styled-components';
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { useSelector } from "react-redux";
import Select from 'react-select';
import { filterDropdown } from "../../config/styles.js";

import TradeNFT from "../components/FolderNFT/tradeNFT";
import PremiumNFTLoading from "../components/Loading/PremiumNFTLoading";
import Empty from "../components/Empty";

const GlobalStyles = createGlobalStyle`
    
    .groups {
        display: grid;
        grid-template-columns: auto auto;
        column-gap: 15px;
    }

    .dropdownSelect {
        width: 200px;
    }
`;

const filters = [
    {
        label: "All",
        value: false
    },
    {
        label: "For Sale",
        value: true
    }
]
const folderNFTs = () => {

    const params = useParams();
    const navigate = useNavigate();
    
    const initialUser = useSelector(({ auth }) => auth.user);
    const [Marketplace, setMarketplace] = useState(null);
    const [nfts, setNFTLists] = useState([]);
    const [restList, setRestList] = useState([]);
    const [artist, setArtist] = useState();
    const [description, setDescription] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [active, setActive] = useState(filters[1]);

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
    },[Marketplace, active])

    const getInitNFTs = async() => {
        const { id } = params;
        let gradList = await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-detail`, { folderID: id, user: initialUser?.username ? initialUser.username : ""}).then(res => {
            let { list, artist: _artist, description: _desc } = res.data;
            setArtist(_artist);
            setDescription(_desc);
            if (active.value) {
                list = list.filter(item => item.action == "list" || item.action == "auction");
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
                    <div className="d-flex align-items-center justify-content-end w-100 gap-3 mb-3">
                        <div>
                            <span className="fs-6">Filter:</span>
                        </div>
                        <div className='dropdownSelect one'>
                            <Select
                                className='select1'
                                styles={filterDropdown}
                                menuContainerStyle={{'zIndex': 999}}
                                value={active}
                                options={filters}
                                onChange={(value) => {
                                    setActive(value);
                                    // setFolderList([]);
                                }}
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
        </div>

    );
}

export default folderNFTs;