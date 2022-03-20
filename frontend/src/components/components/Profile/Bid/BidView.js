import axios from "axios";
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import getWeb3 from "../../../../utils/getWeb3";
import MusicArt from "../../Asset/music";
import VideoArt from "../../Asset/video";

export default function BidView() {

    const initialUser = useSelector((state) => state.auth.user);

    const [bidList, setBidList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({});
    const [isOwner, setOwner] = useState(false);

    const [web3, setWeb3] = useState({});
    const [Marketplace, setMarekplace] = useState({});
    const { tokenID } = useParams();

    useEffect(async() => {
        const { instanceNFT, instanceMarketplace, _web3 } = await getWeb3();
        setWeb3(_web3);
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
            await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-bid`, {id: bidList[index]._id}).then(async(res) => {
                const { bid } = res.data;
                await Marketplace.methods.sell(tokenID, bid.walletAddres, bid.price, bid.signature).send({
                    from: initialUser.walletAddres
                });

                await axios.post(`${process.env.REACT_APP_BACKEND}sale/delist`, {
                    tokenID, walletAddres: initialUser.walletAddres
                }).then(res => {

                }).catch(err => {

                })
            }).catch(err => {
                throw Error(err.response.data.error);
            });
        } catch(err) {
            toast.error(err.message, {
                theme: "colored",
                autoClose: 2000
            })
        }
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