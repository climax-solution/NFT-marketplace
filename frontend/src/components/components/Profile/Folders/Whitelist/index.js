import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

const WhiteListLoading = lazy(() => import("../../../Loading/whiteListLoading"));
const WhitelistItem = lazy(() => import("./whitelistItem"));

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

            /* width */
            ::-webkit-scrollbar {
                width: 10px;
            }

            /* Track */
            ::-webkit-scrollbar-track {
                background: #f1f1f1; 
            }
            
            /* Handle */
            ::-webkit-scrollbar-thumb {
                background: #888; 
            }

            /* Handle on hover */
            ::-webkit-scrollbar-thumb:hover {
                background: #555; 
            }
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

    const [orgWhitelist, setOrgWhiteList] = useState([]);
    const [orgUnWhiteList, setOrgUnWhiteList] = useState([]);

    const [isLoading, setLoading] = useState(true);
    const [updated, setUpdated] = useState(false);

    useEffect(async() =>{
        setLoading(true);
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-private-folder-info`, {folderID}).then(res => {
            const { whiteList, restList, folderInfo } = res.data;
            console.log(restList, whiteList);
            setOrgWhiteList(whiteList);
            setOrgUnWhiteList(restList);

            setWhitelist(whiteList);
            setUnWhitelist(restList);
            setFolderInfo(folderInfo);
        }).catch(err => {

        })
        setLoading(false);
    }, [updated]);

    const filterWhiteList = (e) => {
        const kwd = (e.target.value).toLowerCase().trim();
        let _list = [...orgWhitelist];
        if (kwd) _list = _list.filter(item => item.name.indexOf(kwd) > -1 || item.username.indexOf(kwd) > -1 );
        setWhitelist(_list);
    }

    const filterUnWhiteList = (e) => {
        const kwd = (e.target.value).toLowerCase().trim();
        let _list = [...orgUnWhiteList];
        if (kwd) _list = _list.filter(item => item.name.indexOf(kwd) > -1 || item.username.indexOf(kwd) > -1 );
        setUnWhitelist(_list);
    }

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
                            onChange={filterWhiteList}
                        />
                    </div>
                    <div className="whitelist list">
                        {
                            isLoading ? <WhiteListLoading/>
                            : <>
                            {
                                !whitelist.length ? <p>No items to display</p>
                                : (
                                    whitelist.map((item, index) => (
                                        <WhitelistItem
                                            avatar={item.avatar}
                                            name={item.name}
                                            username={item.username}
                                            isWhite={true}
                                            update={() => setUpdated(!updated)}
                                            activeLoading={setLoading}
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
                            onChange={filterUnWhiteList}
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
                                            update={() => setUpdated(!updated)}
                                            activeLoading={setLoading}
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