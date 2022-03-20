import axios from "axios";
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import getWeb3 from "../../../../utils/getWeb3";

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

        await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID }).then(res => {
            const  { nft, childList } = res.data;
            const _isOwner = nft.walletAddres.toLowerCase() == initialUser.walletAddres.toLowerCase();
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

    return (
        <table class="table">
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
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{web3.utils.fromWei(item.price, 'ether')} BNB</td>
                                        <td>{(item.walletAddres).substr(0, 6) + '...' + (item.walletAddres).substr(-4)}</td>
                                        { isOwner ? <td><button className="btn-main" onClick={() => accept(index)}>Accept</button></td> : ""}
                                    </tr>
                                )
                            })
                        }
                        {
                            !bidList.length && <tr><td colSpan="4">No display items</td></tr>
                        }
                    </>
                }
            </tbody>
        </table>
    )
}