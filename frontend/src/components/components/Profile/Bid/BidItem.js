import axios from "axios";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import getWeb3 from "../../../../utils/getWeb3";
import MusicArt from "../../Asset/music";
import VideoArt from "../../Asset/video";
import Clock from "../../Clock";
import ItemLoading from "../../Loading/ItemLoading";

export default function({ tokenID, remove }) {

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

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

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
                            <div className="nft__item_wrap flex-column position-relative wap-height">
                                
                                {
                                    (!nft.type || nft.type && (nft.type).toLowerCase() == 'image') && <img src={nft.image} onError={failedLoadImage} className="lazy nft__item_preview ratio-1-1" role="button" onClick={() => navigate(`/item-detail/${nft.tokenID}`)} alt=""/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'music') && <MusicArt data={nft} link={`/item-detail/${nft.tokenID}`}/>
                                }

                                {
                                    (nft.type && (nft.type).toLowerCase() == 'video') && <VideoArt data={nft.asset}/>
                                }

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