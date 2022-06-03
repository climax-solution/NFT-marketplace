import axios from "axios";
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import getWeb3 from "../../../../utils/getWeb3";

import Art from "../../Asset/art";
import BidRow from  "./BidRow";

export default function BidView() {

    const initialUser = useSelector((state) => state.auth.user);

    const [bidList, setBidList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({});
    const [isOwner, setOwner] = useState(false);

    const [web3, setWeb3] = useState({});
    const { tokenID } = useParams();

    useEffect(async() => {
        const { instanceNFT, _web3 } = await getWeb3();
        setWeb3(_web3);        

        await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID }).then(async(res) => {
            const  { nft, childList } = res.data;
            if (nft.metadata) {
                try {
                    const _meta = JSON.parse(nft.metadata);
                    setMetadata(_meta);
                } catch(err) {
    
                }
            }

            else {
                const _orgNFT = await instanceNFT.methods.getItemNFT(tokenID).call();
        
                await axios.get(_orgNFT.tokenURI).then(res => {
                    setMetadata(res.data);
                })
            }
            const _isOwner = nft.walletAddress.toLowerCase() == initialUser.walletAddress.toLowerCase();
            setOwner(_isOwner);
            setBidList(childList);
        }).catch(err => {
        });
        setLoading(false);
    },[]);

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
                        <Art
                            tokenID={metadata.tokenID}
                            image={metadata.image}
                            asset={metadata.asset}
                            redirect={() => null}
                            type={metadata.type}
                            ratio={false}
                        />

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
                                            bidList.map((item, idx) => {
                                                return (
                                                    <BidRow
                                                        key={idx}
                                                        index={idx + 1}
                                                        data={item}
                                                        isOwner={isOwner}
                                                        startLoading={setLoading}
                                                        price={web3.utils.fromWei(item.price, 'ether')}
                                                    />
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