import axios from "axios";
import { useParams } from "react-router-dom";
import { success_toastify } from "../../../../../utils/notify";
import "./item.module.css";

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
    )
}