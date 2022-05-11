import Skeleton from "react-loading-skeleton";
import { createGlobalStyle } from "styled-components";
import style from "./whitelist.js";
const GlobalStyle = createGlobalStyle`${style}`;

export default function WhiteListLoading() {
    return (
        <>
            <GlobalStyle/>
            <div className="whitelist-item">
                <div className="user_info">
                    <Skeleton className="avatar rounded-circle"/>
                    <div className="name-group">
                        <Skeleton className="name"/><br/>
                        <Skeleton className="user-name"/>
                    </div>
                </div>
                <Skeleton className="button"/>
            </div>
        </>
    )
}