import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";
import { toast } from "react-toastify";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  .ratio-1-1 {
    aspect-ratio: 1;
  }
`;

export default function Banner({ userData }) {

    const copyAlert = () => {
        toast.error("Copied", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <>
            <GlobalStyles/>
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
                        <img src={`http://nftdevelopments.co.nz/avatar/${userData.avatar}`} className="ratio-1-1" alt="" onError={failedLoadImage} crossOrigin="true"/>
                        <i className="fa fa-check"></i>
                        </div>
                        
                        <div className="profile_name">
                        <h4>
                            {userData.firstName + " " + userData.lastName}
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
                        </div>
                    </div>
                </div>
                </div>
            </div>
            </section>
        </>
    )
}