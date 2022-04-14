import { createGlobalStyle } from "styled-components"

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

export default function WhitelistItem({ avatar, name, username, isWhite }) {
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
                    isWhite ? <button className="btn-main scaleX--1"><i className="fa fa-reply"/></button>
                    : <button className="btn-main btn-green"><i className="fa fa-reply"/></button>
                }
            </div>
        </>
    )
}