import { createGlobalStyle } from "styled-components"
import Skeleton from "react-loading-skeleton";

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
            .name-group {
                .name, .user-name {
                    width: 80px;
                }
            }
        }

        .button {
            width: 80px;
            height: 30px;
        }
    }
`;

export default function WhiteListLoading() {
    return (
        <>
            <GlobalStyles/>
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