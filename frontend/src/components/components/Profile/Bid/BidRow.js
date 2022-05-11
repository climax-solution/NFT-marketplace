import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import getWeb3 from "../../../../utils/getWeb3";
import { error_toastify, success_toastify } from "../../../../utils/notify";
import { marketplace_addr } from "../../../../config/address.json";
import { useSelector } from "react-redux";

export default function BidRow({ index, data, price, isOwner, startLoading }) {
    const initialUser = useSelector((state) => state.auth.user)
    const navigate = useNavigate();

    const [Marketplace, setMarekplace] = useState({});
    const [WBNB, setWBNB] = useState({});
    const { tokenID } = useParams();

    useEffect(async() => {
        const { instanceMarketplace, instanceWBNB } = await getWeb3();
        setWBNB(instanceWBNB);
        setMarekplace(instanceMarketplace);
    }, []);

    const accept = async() => {
        try {
            startLoading(true);
            const status = await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-nft-item`, { tokenID }).then(res => {
                const { nft: _nft } = res.data;
                if (_nft.action == "auction") return _nft.status == "premium" ? true : false;
                else return "error";
            });
            
            if (status == "error") throw Error();

            await axios.post(`${process.env.REACT_APP_BACKEND}sale/get-bid-item`, {id: data._id}).then(async(res) => {
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
                success_toastify("Accepted bid");
                navigate('/explore');
            }).catch(err => {
                throw Error(err.reponse?.data?.err ? err.reponse.data.err : err.message );
            });
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";
            else if (err?.message) message = err.message;

            error_toastify(message);
        }
        startLoading(false);
    }

    return (
        <tr>
            <td>{index}</td>
            <td>{price} BNB</td>
            <td>{(data.walletAddress).substr(0, 6) + '...' + (data.walletAddress).substr(-4)}</td>
            { isOwner ? <td className="text-center"><button className="btn-main d-inline-block" onClick={() => accept()}>Accept</button></td> : <></>}
        </tr>
    )
}