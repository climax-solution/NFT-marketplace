import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useSelector } from 'react-redux';

const BidItem = lazy(() => import("./BidItem"));
const Empty = lazy(() => import("../../Empty"));
const PremiumNFTLoading = lazy(() => import("../../Loading/PremiumNFTLoading"));
const InfiniteScroll = lazy(() => import("react-infinite-scroll-component"));

export default function() {
    
    const initialUser = useSelector((state) => state.auth.user);

    const [nfts, setNFTs] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [restList, setRestList] = useState({});

    useEffect(async() => {
        if (initialUser.walletAddress) {
            await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-bid-list`, {
                walletAddress: initialUser.walletAddress
            }).then(async(res) => {
                const { nfts: _nfts, bids } = res.data;
                setNFTs(_nfts);
                setRestList(bids);
            }).catch(err => {
                setNFTs([]);
            })
            setLoading(false);
        }
    }, [initialUser])

    const fetchNFT = async () => {
        let list = restList;
        if (list.length > 8) {
            list = list.slice(0,8);
            setRestList(restList.slice(8, restList.length));
        } else setRestList([]);
        
        setNFTLists([...nfts, ...list]);
    }

    const remove = (index) => {
        let exist = [ ...nfts ];
        exist.splice(index, 1);
        setNFTs(exist);
    }

    return (
        <div className="row">
            {
                isLoading ? <PremiumNFTLoading/>:
                <>
                    <InfiniteScroll
                        dataLength={nfts.length}
                        next={fetchNFT}
                        hasMore={restList.length ? true : false}
                        loader={<PremiumNFTLoading/>}
                        className="row"
                    >
                        {
                            nfts.map( (nft, idx) => {
                                return (
                                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4 position-relative" key={index}>
                                        <BidItem tokenID={nft.tokenID} remove={() => remove(idx)} key={idx}/>
                                    </div>
                                )
                            })
                        }
                    </InfiniteScroll>
                    {
                        (nfts.length + Object.keys(restList).length) == 0 && <Empty/>
                    }
                </>
            }
        </div>
    )
}