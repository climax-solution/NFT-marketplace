import { lazy, useEffect, useState } from "react";
import axios from "axios";
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import getWeb3 from "../../../utils/getWeb3";
import Art from "../Asset/art";

const ItemLoading = lazy(() => import("../Loading/ItemLoading"));

const GlobalStyles = createGlobalStyle`
   .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }
`;

const Folder = ({ folderID }) => {

    const navigate = useNavigate();

    const [nft, setNFT] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(async() => {
        const { instanceNFT } = await getWeb3();
        const _list = await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-interface`, { folderID }).then(async(res) => {
            const  { list, initialNFT } = res.data;
            let initNFTData = {};
            if (initialNFT) {
                const tokenURI = await instanceNFT.methods.tokenURI(initialNFT.tokenID).call();
                initNFTData = await axios.get(tokenURI).then(result => {
                    return result.data;
                });
            }
            return { ...list, ...initNFTData};
        }).catch(err => {
            return {};
        });
        setNFT(_list);
        setLoading(false);
    },[folderID])

    return (
        <>
            <GlobalStyles/>
            {
                loading ? <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"><ItemLoading/></div>
                : (
                    Object.keys(nft).length ? (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                            <div className="nft__item m-0 pb-4 h-100 justify-content-between">
                                <div className="author_list_pp">
                                    <span onClick={()=> navigate(`/user/${nft.folder.artist}`)}>                                    
                                        <img className="lazy" src={`${process.env.REACT_APP_BACKEND}avatar/${nft.artistData.avatar}`} alt="" crossOrigin="true"/>
                                        <i className="fa fa-check"></i>
                                    </span>
                                </div>
                                <div className="nft__item_wrap w-100 ratio-1x1">
                                    <Art
                                        tokenID={nft.tokenID}
                                        image={nft.image}
                                        asset={nft.asset}
                                        redirect={() => navigate(`/folder-explorer/${nft.folder._id}`)}
                                        type={nft.type}
                                    />
                                </div>
                                <div className="nft__item_info mb-0 mt-1">
                                    <span>
                                        <h4>
                                            <span onClick={() => navigate(`/folder-explorer/${nft.folder._id}`)} className="text-white">{nft.folder.name}</span></h4>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : ""
                )
            }
        </>
    )
}

export default Folder;