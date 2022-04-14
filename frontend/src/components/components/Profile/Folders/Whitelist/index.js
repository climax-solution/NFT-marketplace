import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import WhiteListLoading from "../../../Loading/whiteListLoading";
import WhitelistItem from "./whitelistItem";

const GlobalStyles = createGlobalStyle`
    .container {
        max-width: 1170px;
    }
    .list-box {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 20px;
        max-width: 500px;
        width: 100%;
        .list {
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            min-height: 300px;
            max-height: 300px;
            overflow: auto;

            display: flex;
            flex-direction: column;
            grid-gap: 10px;
        }
    }

    .manage-content {
        max-width: 1170px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
    }

    .folder-name {
        text-shadow: 2px 2px 0 #4074b5, 2px -2px 0 #4074b5, -2px 2px 0 #4074b5, -2px -2px 0 #4074b5, 2px 0px 0 #4074b5, 0px 2px 0 #4074b5, -2px 0px 0 #4074b5, 0px -2px 0 #4074b5;
        font-size: 26px;
    }
`;

export default function Whitelist() {

    const { folderID } = useParams();
    const [whitelist, setWhitelist] = useState([]);
    const [folderinfo, setFolderInfo] = useState([]);
    const [unWhitelist, setUnWhitelist] = useState([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(async() =>{
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-private-folder-info`, {folderID}).then(res => {
            const { whiteList, restList, folderInfo } = res.data;
            console.log(restList, whiteList);
            setWhitelist(whiteList);
            setUnWhitelist(restList);
            setFolderInfo(folderInfo);
        }).catch(err => {

        })
        setLoading(false);
    }, []);

    return (
        <div className="container">
            <GlobalStyles/>
            <div className="title">
                <h3 className="folder-name">{folderinfo.name}</h3>
            </div>
            <div className="manage-content">
                <div className="list-box whitelist-box">
                    <h3>Whitelited Users</h3>
                    <div className="search-bar">
                        <input
                            className="form-control"
                            placeholder="Search user"
                        />
                    </div>
                    <div className="whitelist list">
                        {
                            isLoading ? <WhiteListLoading/>
                            : <>
                            {
                                !unWhitelist.length ? <p>No items to display</p>
                                : (
                                    unWhitelist.map((item, index) => (
                                        <WhitelistItem
                                            avatar={item.avatar}
                                            name={item.name}
                                            username={item.username}
                                            isWhite={true}
                                            key={index}
                                        />
                                    ))
                                )
                            }
                            </>
                        }
                        
                        
                    </div>
                </div>
                <div className="replace-icon">
                    <i className="fa fa-long-arrow-right fa-2x d-block"/>
                    <i className="fa fa-long-arrow-left fa-2x d-block"/>
                </div>
                <div className="list-box whitelist-box">
                    <h3>Unwhitelisted Users</h3>
                    <div className="search-bar">
                        <input
                            className="form-control"
                            placeholder="Search user"
                        />
                    </div>
                    <div className="un-whitelist list">
                    {
                            isLoading ? <WhiteListLoading/>
                            : <>
                            {
                                !unWhitelist.length ? <p>No items to display</p>
                                : (
                                    unWhitelist.map((item, index) => (
                                        <WhitelistItem
                                            avatar={item.avatar}
                                            name={item.name}
                                            username={item.username}
                                            isWhite={false}
                                            key={index}
                                        />
                                    ))
                                )
                            }
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}