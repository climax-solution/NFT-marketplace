import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import Empty from "../../../Empty";
import WhitelistItem from "./whitelistItem";

const GlobalStyles = createGlobalStyle`
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
`;

export default function Whitelist() {

    const { folderID } = useParams();
    const [whitelist, setWhitelist] = useState([]);
    const [unWhitelist, setUnWhitelist] = useState([]);

    useEffect(async() =>{
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-private-folder-info`, {folderID}).then(res => {
            const { whiteList, restList } = res.data;
            console.log(restList, whiteList);
            setWhitelist(whiteList);
            setUnWhitelist(restList);
        }).catch(err => {

        })
    }, []);

    return (
        <div className="container manage-content">
            <GlobalStyles/>
            <div className="list-box whitelist-box">
                <h3>Whitelited Users</h3>
                <div className="search-bar">
                    <input className="form-control"/>
                </div>
                <div className="whitelist list">
                    {
                        whitelist.map((item, index) => (
                            <WhitelistItem
                                avatar={item.avatar}
                                name={item.name}
                                username={item.username}
                                key={index}
                            />
                        ))
                    }

                    {
                        !whitelist.length && <p>No items to display</p>
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
                    <input className="form-control"/>
                </div>
                <div className="un-whitelist list">
                    {
                        unWhitelist.map((item, index) => (
                            <WhitelistItem
                                avatar={item.avatar}
                                name={item.name}
                                username={item.username}
                                key={index}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}