import { useSelector } from "react-redux";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {  info_toastify } from "../../../utils/notify";

export default function UserInfo() {
    
    const userData = useSelector((state) => state.auth.user);

    return (
        <div className="profile_name w-50">
            {
                Object.keys(userData).length &&
                <h4>
                    {`${userData.name}`}
                    <span className="profile_username">@{userData.username}</span>
                    <span id="wallet" className="profile_wallet mt-1">{userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                    <CopyToClipboard
                        text={userData.walletAddress}
                        onCopy={() => info_toastify('Copied')}
                    >
                    <button id="btn_copy" className="position-relative ms-2">Copy</button>
                    </CopyToClipboard>
                </h4>
            }
        </div>
    )
}