import { lazy, useEffect, useState } from "react";
import axios from "axios";
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import getWeb3 from "../../../../utils/getWeb3";
import Art from "../../Asset/art";

const ItemLoading = lazy(() => import("../../Loading/ItemLoading"));

const GlobalStyles = createGlobalStyle`
   .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }

    .btn-group-overlay {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        opacity: 0;
        transition: 0.5s ease;
        display: flex;
        flex-direction: column;
        grid-gap: 10px;
        justify-content: center;
        align-items: center;
        .btn:before {
            background-image: none !important;
        }
    }

    .folder-item:hover .btn-group-overlay {
        opacity: 1;
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

    console.log(nft, loading);
    return (
        <>
            <GlobalStyles/>
            {
                loading ? <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"><ItemLoading/></div>
                : (
                    Object.keys(nft).length ? (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                            <div className="nft__item folder-item m-0 pb-4 h-100 justify-content-between">
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
                                <div className="btn-group-overlay">
                                    {
                                        !nft.isPublic ? 
                                        <>
                                            <button className="btn btn-success">Make To Public</button>
                                            <button className="btn btn-success">Manage User</button>
                                        </>
                                        : <button className="btn btn-success">Make To Private</button>
                                    }
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