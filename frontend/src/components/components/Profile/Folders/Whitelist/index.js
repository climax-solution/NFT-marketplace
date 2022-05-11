import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import WhiteListLoading from "../../../Loading/whiteListLoading";
import WhitelistItem from "./whitelistItem";
import "./style.css";

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