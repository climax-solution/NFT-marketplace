import { lazy, useEffect, useState } from "react";
import axios from "axios";
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import getWeb3 from "../../../../../utils/getWeb3";
import Art from "../../../Asset/art";
import { error_toastify, success_toastify } from "../../../../../utils/notify";

const ItemLoading = lazy(() => import("../../../Loading/ItemLoading"));

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
        button {
            width: 200px;
        }
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

    const [folder, setNFT] = useState({});
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
                }).catch(err => {
                    return {};
                });
            }
            return { ...list, ...initNFTData};
        }).catch(err => {
            return {};
        });
        setNFT(_list);
        setLoading(false);
    },[folderID])

    const updateFolder = async(status) => {
        setLoading(true);
        const jwtToken = localStorage.getItem("nftdevelopments-token");
        const _headers = { headers :{ Authorization: JSON.parse(jwtToken) } };
        const data = {
            folderID, status
        };
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/convert-folder-type`, data, _headers).then(res => {
            const { message } = res.data;
            success_toastify(message);
            setNFT({ ...folder, isPublic: status});
        }).catch(err => {
            const { error } = err.response.data;
            error_toastify(error);
        });
        setLoading(false);
    }

    return (
        <>
            <GlobalStyles/>
            {
                loading ? <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"><ItemLoading/></div>
                : (
                    Object.keys(folder).length ? (
                        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                            <div className="nft__item folder-item m-0 pb-4 h-100 justify-content-between">
                                <div className="nft__item_wrap w-100 ratio-1x1">
                                    <Art
                                        tokenID={folder.tokenID}
                                        image={folder.image}
                                        asset={folder.asset}
                                        redirect={() => navigate(`/folder-explorer/${folder.folder._id}`)}
                                        type={folder.type}
                                    />
                                </div>
                                <div className="nft__item_info mb-0 mt-1">
                                    <span>
                                        <h4>
                                            <span onClick={() => navigate(`/folder-explorer/${folder.folder._id}`)} className="text-white">{folder.folder.name}</span></h4>
                                    </span>
                                </div>
                                <div className="btn-group-overlay">
                                    {
                                        !folder.isPublic ? 
                                        <>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => updateFolder(true)}
                                            >Make To Public</button>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => navigate('manage-whitelist/'+folderID)}
                                            >Manage User</button>
                                        </>
                                        : <button
                                            className="btn btn-success"
                                            onClick={() => updateFolder(false)}
                                        >Make To Private</button>
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