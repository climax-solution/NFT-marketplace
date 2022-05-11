import axios from "axios";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import getWeb3 from "../../../../utils/getWeb3";

import Art from "../../Asset/art";
import Clock from "../../Clock";
import ItemLoading from "../../Loading/ItemLoading";

export default function BidItem({ tokenID, remove }) {

    const navigate = useNavigate();

    const initialUser = useSelector((state) => state.auth.user);
    const [nft, setNFT] = useState({});
    const [isLoading, setLoading] = useState(true);

    useEffect(async() => {
        if (!tokenID) {
            setLoading(false);
            return;
        };
        const { instanceNFT } = await getWeb3();
        const _nft = await instanceNFT.methods.getItemNFT(tokenID).call();
        if ((_nft.owner).toLowerCase() == (initialUser.walletAddress).toLowerCase()) {
            await axios.get(_nft.tokenURI).then(res => {
                setNFT({ ..._nft, ...res.data });
            }).catch(err => {
                remove();
                setNFT({});
            })
        }
        setLoading(false);
    },[tokenID])
    
    return (
        <div>
            {
                isLoading ? <ItemLoading/>
                : <>
                {
                    Object.keys(nft).length ? (
                        <div className={`nft__item my-0 pb-4 justify-content-between h-100`}>
                            {
                                nft.action == "auction" &&
                                <div className="de_countdown">
                                    <Clock deadline={new Date(nft.deadline).toLocaleDateString()} />
                                </div>
                            }
                            <div className="nft__item_wrap w-100 ratio-1-1 flex-column position-relative">
                                
                                <Art
                                    tokenID={nft.tokenID}
                                    image={nft.image}
                                    asset={nft.asset}
                                    redirect={() => navigate(`/item-detail/${nft.tokenID}`)}
                                    type={nft.type}
                                />

                            </div>
                            <div className="nft__item_info mb-0">
                                <span>
                                    <h4 onClick={() => navigate(`/item-detail/${nft.tokenID}`)}>{nft.nftName}</h4>
                                </span>
                                <div className="trade-btn-group mt-2">
                                    <span className="btn-main w-100" onClick={() => navigate(`/explore-bids/${nft.tokenID}`)}>View Bids</span>
                                </div>
                            </div>
                        </div>
                    ) : ""
                }
                </>
            }
        </div>
    )
}