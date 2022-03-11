import { useSelector } from "react-redux";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from "react-toastify";

export default function UserInfo() {
    
    const userData = useSelector((state) => state.auth.user);

    const copyAlert = () => {
        toast.info('Copied', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
    }
    
    return (
        <div className="profile_name w-50">
            {
                Object.keys(userData).length &&
                <h4>
                    {`${userData.firstName}  ${userData.lastName}`}
                    <span className="profile_username">@{userData.username}</span>
                    <span id="wallet" className="profile_wallet mt-1">{userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                    <CopyToClipboard
                        text={userData.walletAddress}
                        onCopy={copyAlert}
                    >
                    <button id="btn_copy" className="position-relative ms-2">Copy</button>
                    </CopyToClipboard>
                </h4>
            }
        </div>
    )
}