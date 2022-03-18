import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import getWeb3 from "../../../../utils/getWeb3";

export default function() {
    
    const initialUser = useSelector((state) => state.auth.user);

    const [nfs, setNFTs] = useState([]);
    const [bidList, setBidList] = useState({});

    useEffect(async() => {
        if (initialUser.walletAddress) {
            const { instanceNFT } = await getWeb3();
            await axios.post('http://localhost:7060/sale/get-bid-list', {
                walletAddress: initialUser.walletAddress
            }).then(async(res) => {
                const { nfts, bids } = res.data;
                const nftList = [];
                for await (let item of nfts) {
                    const nft = await instanceNFT.methods.getItemNFT(item.tokenID).call();
                    await axios.get(nft.tokenURI).then(res => {
                        
                    }).catch(err => {

                    })
                }
            }).catch(err => {
                
            })
        }
    }, [initialUser])

    return (
        <div>

        </div>
    )
}