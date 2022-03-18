import axios from "axios";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useSelector } from 'react-redux';
import BidItem from "./BidItem";
import Empty from "../../Empty";

export default function() {
    
    const initialUser = useSelector((state) => state.auth.user);

    const [nfts, setNFTs] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [bidList, setBidList] = useState({});

    useEffect(async() => {
        if (initialUser.walletAddress) {
            await axios.post('http://localhost:7060/sale/get-bid-list', {
                walletAddress: initialUser.walletAddress
            }).then(async(res) => {
                const { nfts, bids } = res.data;
                setNFTs(nfts);
                setBidList(bids);
            }).catch(err => {
                setNFTs([]);
            })
            setLoading(false);
        }
    }, [initialUser])

    return (
        <div className="row">
            {
                isLoading ? (
                    <>
                        <div className="col-md-4 col-sm-6 col-12">
                            <div className="bid-loading">
                                <Skeleton className="w-50px nft-art rounded-circle ratio-1-1"/>
                                <Skeleton className="nft-name ms-2"/>
                            </div>
                        </div>
                        <div className="col-md-4 col-sm-6 col-12">
                            <div className="bid-loading">
                                <Skeleton className="w-50px nft-art rounded-circle ratio-1-1"/>
                                <Skeleton className="nft-name ms-2"/>
                            </div>
                        </div>
                        <div className="col-md-4 col-sm-6 col-12">
                            <div className="bid-loading">
                                <Skeleton className="w-50px nft-art rounded-circle ratio-1-1"/>
                                <Skeleton className="nft-name ms-2"/>
                            </div>
                        </div>
                    </>
                ) :
                <>
                    {
                        nfts.map(item => {
                            return (
                                <div className="col-md-4 col-sm-6 col-12">
                                    <BidItem tokenID={item.tokenID}/>
                                </div>
                            )
                        })
                    }
                    {
                        !nfts.length && <Empty/>
                    }
                </>
            }
        </div>
    )
}