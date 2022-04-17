import axios from "axios";
import { useParams } from "react-router-dom";
import { createGlobalStyle } from "styled-components"
import { error_toastify, success_toastify } from "../../../../../utils/notify";

const GlobalStyles = createGlobalStyle`
    .whitelist-item {
        box-shadow: 0 1px 5px rgba(255, 255, 255, 0.3);
        padding: 20px;
        border-radius: 10px;
        
        display: flex;
        align-items: center;
        justify-content: space-between;
        grid-gap: 20px;
        
        .user_info {
            display: flex;
            grid-gap: 10px;
            align-items: center;
            .avatar {
                width: 60px;
                height: 60px;
            }
        }
        .scaleX--1 {
            transform: scaleX(-1);
        }
    }
`;

export default function WhitelistItem({ avatar, name, username, isWhite, update, activeLoading }) {

    const { folderID } = useParams();

    const updateUser = async() => {
        activeLoading(true);
        const api = `${process.env.REACT_APP_BACKEND}folder/${isWhite ? "remove-user-from-whitelist" : "add-user-to-whitelist" }`;
        
        const data = {
            folderID, user: username    
        };

        const jwtToken = localStorage.getItem("nftdevelopments-token");
        const _headers = { headers :{ Authorization: JSON.parse(jwtToken) } };

        await axios.post(api, data, _headers).then(res => {
            const { message } = res.data;
            success_toastify(message);
        }).catch(err => {
            console.log(JSON.parse(JSON.stringify(err)));
            // const { error } = err.response.data;
        // error_toastify(error);
        });
        update();
    }

    return (
        <>
            <GlobalStyles/>
            <div className="whitelist-item">
                <div className="user_info">
                    <img
                        src={process.env.REACT_APP_BACKEND + "avatar/" +  avatar}
                        className="avatar rounded-circle"
                        crossOrigin="true"
                    />
                    <div className="name-group">
                        <span className="full-name">{name}</span><br/>
                        <span className="user-name text-danger">@{username}</span>
                    </div>
                </div>
                {
                    isWhite ? <button className="btn-main scaleX--1" onClick={updateUser}><i className="fa fa-reply"/></button>
                    : <button className="btn-main btn-green" onClick={updateUser}><i className="fa fa-reply"/></button>
                }
            </div>
        </>
    )
}