import axios from "axios";
import { useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import getWeb3 from "../../../../utils/getWeb3";

export default function({ tokenID }) {

    const initialUser = useSelector((state) => state.auth.user);

    const [nft, setNFT] = useState();
    const [isLoading, setLoading] = useState(false);

    useEffect(async() => {
        if (!tokenID) return;
        const { instanceNFT } = await getWeb3();
        const nft = await instanceNFT.methods.getItemNFT(tokenID).call();
        if ((nft.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase()) {
            await axios.get(nft.tokenURI).then(res => {
                setNFT({ ...nft, ...tokenID });
            }).catch(err => {
                setNFT({});
            })
        }
    },[tokenID])

    return (
        <div>
            {
                isLoading ? (
                    <div className="border border-dark rounded p-3">
                        <Skeleton className="w-50px rounded-circle ratio-1-1"/>
                        <Skeleton/>
                    </div>
                )
                : (
                    <div>
                        <img src={nft.image} className="rounded-circle w-50px ratio-1-1"/>
                        <span>{nft.nftName}</span>
                        <button className="btn-main">View Bids</button>
                    </div>
                )
            }
        </div>
    )
}