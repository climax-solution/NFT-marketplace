import Skeleton from "react-loading-skeleton";
import "./whitelist.module.css";

export default function WhiteListLoading() {
    return (
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
    )
}