import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";
import { info_toastify } from "../../../utils/notify";
import "./style.module.css";

const socials =  [
    {key: "facebook", icon: 'fab fa-facebook'},
    {key: "twitter", icon: 'fab fa-twitter'},
    {key: "instagram", icon: 'fab fa-instagram'},
    {key: "tiktok", icon: 'fab fa-tiktok'},
    {key: "linkedin", icon: 'fab fa-linkedin'},
    {key: "telegram", icon: 'fab fa-telegram'},
];

export default function Banner({ userData }) {

    const copyAlert = () => {
        info_toastify("copied");
    }

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <>
            <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/img/background/4.jpg'})`}}>
                <div className='mainbreadcumb'>
                </div>
            </section>

            <section className='container d_coll no-top no-bottom'>
            <div className='row'>
                <div className="col-md-12">
                <div className="d_profile">
                    <div className="profile_avatar">
                        <div className="d_profile_img">
                        <img src={`${process.env.REACT_APP_BACKEND}avatar/${userData.avatar}`} className="ratio-1-1" alt="" onError={failedLoadImage} crossOrigin="true"/>
                        <i className="fa fa-check"></i>
                        </div>
                        
                        <div className="profile_name">
                            <h4>
                                {userData.name}
                            </h4>
                            <div className="d-flex justify-content-center">
                                <span id="wallet" className="profile_wallet mx-2">{ userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                                <CopyToClipboard
                                    text={userData.walletAddress}
                                    onCopy={copyAlert}
                                >
                                    <button id="btn_copy" className="position-relative">Copy</button>
                                </CopyToClipboard>
                            </div>
                            {
                                userData ? 
                                    <div className="social-links">
                                        {
                                            socials.map((item, index) => {
                                                if (userData[item.key]) {
                                                    return (
                                                        <span onClick={()=> window.open(`${userData[item.key]}`, "_blank")} key={index}><i className={item.icon}></i></span>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                : ""
                            }
                            {
                                userData?.description ?
                                    <p className="bio mt-3 border p-3 word-break-all rounded border-grey text-center">{userData?.description}</p>
                                : ""
                            }
                        </div>
                    </div>
                </div>
                </div>
            </div>
            </section>
        </>
    )
}