import axios from "axios";
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import getWeb3 from "../../../../utils/getWeb3";
import { marketplace_addr } from "../../../../config/address.json";

const MusicArt = lazy(() => import("../../Asset/music"));
const VideoArt = lazy(() => import("../../Asset/video"));


export default function BidView() {

    const initialUser = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [bidList, setBidList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({});
    const [isOwner, setOwner] = useState(false);

    const [web3, setWeb3] = useState({});
    const [Marketplace, setMarekplace] = useState({});
    const [WBNB, setWBNB] = useState({});
    const { tokenID } = useParams();

    useEffect(async() => {
        const { instanceNFT, instanceMarketplace, _web3, instanceWBNB } = await getWeb3();
        setWeb3(_web3);
        setWBNB(instanceWBNB);
        setMarekplace(instanceMarketplace);
        
        const _orgNFT = await instanceNFT.methods.getItemNFT(tokenID).call();
        await axios.get(_orgNFT.tokenURI).then(res => {
            setMetadata(res.data);
        })

        await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID }).then(res => {
            const  { nft, childList } = res.data;
            const _isOwner = nft.walletAddress.toLowerCase() == initialUser.walletAddress.toLowerCase();
            setOwner(_isOwner);
            setBidList(childList);
        }).catch(err => {
        });
        setLoading(false);
    },[]);

    const accept = async(index) => {
        try {
            setLoading(true);
            const status = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID }).then(res => {
                const { nft: _nft } = res.data;
                if (_nft.action == "auction") return _nft.status;
                else return false;
            });
            
            if (!status) throw Error();

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-bid-item`, {id: bidList[index]._id}).then(async(res) => {
                const { bid } = res.data;
                const bidderBalance = await WBNB.methods.balanceOf(bid.walletAddress).call();

                const bidderAllowance = await WBNB.methods.allowance(bid.walletAddress, marketplace_addr).call();
                if (bidderBalance * 1 < bid.price * 1 || bidderAllowance * 1 < bid.price * 1) throw Error("This user's WBNB balance is not enough to accept");
                await Marketplace.methods.sell(tokenID, bid.walletAddress, bid.price, status, bid.signature).send({
                    from: initialUser.walletAddress
                });

                await axios.post(`${process.env.REACT_APP_BACKEND}sale/accept-offer`, {
                    tokenID, bidder: bid.walletAddress
                }).then(res => {

                }).catch(err => {

                });
                toast.success("Accepted bid", {
                    theme: 'colored',
                    autoClose: 2000
                });
                navigate('/explore');
            }).catch(err => {
                throw Error(err.reponse?.data?.err ? err.reponse.data.err : err.message );
            });
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

            toast.error(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
        }
        setLoading(false);
    }

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <>
            <section className='jumbotron breadcumb no-bg'>
                <div className='mainbreadcumb'>
                <div className='container'>
                    <div className='row m-10-hor'>
                    <div className='col-12'>
                        <h1 className='text-center'>Explore Bid</h1>
                    </div>
                    </div>
                </div>
                </div>
            </section>

            <section className='container'>
                <div className="row">
                    <div className="col-md-6 col-12 d-flex justify-content-center align-items-center flex-column">
                        {
                            isLoading && <Skeleton className="ratio-1-1"/>
                        }
                        {
                            (!metadata.type || metadata.type && (metadata.type).toLowerCase() == 'image') && <img src={metadata.image} onError={failedLoadImage} className="img-fluid img-rounded mb-sm-30" alt=""/>
                        }

                        {
                            (metadata.type && (metadata.type).toLowerCase() == 'music') && <MusicArt data={metadata} link={``}/>
                        }

                        {
                            (metadata.type && (metadata.type).toLowerCase() == 'video') && <VideoArt data={metadata.asset}/>
                        }
                        {
                            <h3 className="text-center my-4">{ isLoading ? <Skeleton/> : metadata.nftName}</h3>
                        }
                    </div>
                    <div className="col-md-6 col-12">
                        <h3>Bids</h3>
                        <table className="table table-dark table-bordered table-responsive text-center">
                            <thead>
                                <tr>
                                <th scope="col">#</th>
                                <th scope="col">Price</th>
                                <th scope="col">Bidder</th>
                                { isOwner ? <th scope="col">Action</th> : "" }
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    isLoading ? (
                                        <>
                                            <tr><td colSpan="4"><Skeleton height={30}/></td></tr>
                                            <tr><td colSpan="4"><Skeleton height={30}/></td></tr>
                                            <tr><td colSpan="4"><Skeleton height={30}/></td></tr>
                                        </>
                                    ) : <>
                                        {
                                            bidList.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{web3.utils.fromWei(item.price, 'ether')} BNB</td>
                                                        <td>{(item.walletAddress).substr(0, 6) + '...' + (item.walletAddress).substr(-4)}</td>
                                                        { isOwner ? <td className="text-center"><button className="btn-main d-inline-block" onClick={() => accept(index)}>Accept</button></td> : ""}
                                                    </tr>
                                                )
                                            })
                                        }
                                        {
                                            !bidList.length && <tr><td colSpan="4" className="text-center">No display items</td></tr>
                                        }
                                    </>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </>
    )
}