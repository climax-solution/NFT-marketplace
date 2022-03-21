import React, { useState, lazy } from "react";
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { UPDATE_AUTH } from "../../store/action/auth.action";
import { WalletConnect } from "../../store/action/wallet.action";
import Mint from "../components/Profile/Mint/Mint";
import Bid from "../components/Profile/Bid/Bid";

const SellingNFT = lazy(() => import('../components/Profile/SellingNFT/SellingNFT'));
const NotSellingNFT = lazy(() => import('../components/Profile/NotSellingNFT/NotSellingNFT'));
const Avatar = lazy(() => import("../components/Profile/avatar"));
const UserInfo = lazy(() => import("../components/Profile/userInfo"));
const ManageInfo = lazy(() => import("../components/Profile/manageInfo"));
const Footer = lazy(() => import('../components/footer'));

const GlobalStyles = createGlobalStyle`
  .ml-12 {
    margin-left: 12px;
  }
  .avatar-change {
    height: 100%;
    position: absolute;
    background: rgba(0,0,0,0.4);
    min-width: 150px;
    z-index: 999;
    border-radius: 50%;
    transition: 0.2s ease;
  }

  .profile_avatar {
    min-width: 350px;
    min-height: 150px;
  }

  .index-avatar {
    backface-visibility: hidden;
    aspect-ratio: 1;
  }

  .edit-btn {
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    cursor: pointer;
  }

  .user-info {
    border: 1px solid #333;
    border-radius: 5px;
  }

  .trade-btn-group {
    span {
      padding: 2px 10px;
    }
  }

  .mn-h-300px {
    min-height: 300px;
  }

  .overflow-unset {
    overflow: unset !important;
  }

  .btn-apply {
    background: #3fb737;
  }

  .btn-apply:hover {
    box-shadow: 2px 2px 20px 0px #3fb737;
  }
  .groups {
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 15px;
  }
`;

const Profile = function() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);

  const logout = () => {
    localStorage.removeItem("nftdevelopments-token");
    localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
    dispatch(UPDATE_AUTH({ walletAddress: '' }));
    dispatch(WalletConnect());
    navigate('/');
  }

  return (
    <div>
      <>
        <GlobalStyles/>

        <section className='container no-bottom'>
          <div className='row'>
            <div className='spacer-double'></div>
            <div className="col-md-12">
              <div className="d_profile de-flex">
                <div className="de-flex-col">
                    <div className="profile_avatar d-flex">
                        <Avatar/>
                        <UserInfo/>
                    </div>
                </div>
                <div className="profile_follow de-flex">
                  <div className="de-flex-col">
                      <span className="btn-main" onClick={logout}>Sign out</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container no-top'>
          <div className='row'>
            <div className='col-lg-12'>
                <div className="items_filter">
                  <ul className="de_nav text-md-start text-center">
                    <li id='Mainbtn' className={activeTab == 0 ? 'active mt-1' : 'mt-1'}><span onClick={() => setActiveTab(0)}>On Sale</span></li>
                    <li id='Mainbtn1' className={activeTab == 1 ? 'active mt-1' : 'mt-1'}><span onClick={() => setActiveTab(1)}>Collected</span></li>
                    <li id='Mainbtn2' className={activeTab == 2 ? 'active mt-1' : 'mt-1'}><span onClick={() => setActiveTab(2)}>User Info</span></li>
                    <li id='Mainbtn3' className={activeTab == 3 ? 'active mt-1' : 'mt-1'}><span onClick={() => setActiveTab(3)}>Bids</span></li>
                    <li id='Mainbtn4' className={activeTab == 4 ? 'active mt-1' : 'mt-1'}><span onClick={() => setActiveTab(4)}>Mint</span></li>
                  </ul>
              </div>
            </div>
          </div>

          {
              activeTab == 0 && (
                <div id='zero1' className='onStep fadeIn mn-h-300px'>
                  <SellingNFT/>
                </div>
              )
          }
          {
              activeTab == 1  && (
                <div id='zero2' className='onStep fadeIn mn-h-300px'>
                  <NotSellingNFT/>
                </div>
              )
          }

          {
            activeTab == 2 && <ManageInfo/>
          }

          {
            activeTab == 3 && <Bid/>
          }

          {
            activeTab == 4 && <Mint/>
          }
        </section>

        <Footer />
      </>
    </div>
  );
}
export default Profile;