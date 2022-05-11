import React, { useState } from "react";
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { UPDATE_AUTH } from "../../../store/action/auth.action";
import { WalletConnect } from "../../../store/action/wallet.action";
import { createGlobalStyle } from "styled-components";
import Avatar from "../../components/Profile/avatar";
import UserInfo from "../../components/Profile/userInfo";
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

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
    <>
      <GlobalStyle/>
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
                  <li
                    id='Mainbtn'
                    className={activeTab == 0 ? 'active mt-1' : 'mt-1'}
                  >
                    <span
                      onClick={() => { navigate(''); setActiveTab(0); }}
                    >On Sale</span></li>
                  <li
                    id='Mainbtn1'
                    className={activeTab == 1 ? 'active mt-1' : 'mt-1'}
                  >
                    <span
                      onClick={() => { navigate('collected'); setActiveTab(1); }}
                    >Collected</span></li>
                  <li
                    id='Mainbtn2'
                    className={activeTab == 2 ? 'active mt-1' : 'mt-1'}
                  >
                    <span
                      onClick={() => { navigate('userinfo'); setActiveTab(2); }}
                    >User Info</span></li>
                  <li
                    id='Mainbtn3'
                    className={activeTab == 3 ? 'active mt-1' : 'mt-1'}
                  >
                    <span
                      onClick={() => { navigate('bids'); setActiveTab(3); }}
                    >Bids</span></li>
                  <li
                    id='Mainbtn4'
                    className={activeTab == 4 ? 'active mt-1' : 'mt-1'}
                  >
                    <span
                      onClick={() => { navigate('mint'); setActiveTab(4); }}
                    >Mint</span></li>
                  <li
                    id='Mainbtn5'
                    className={activeTab == 5 ? 'active mt-1' : 'mt-1'}
                  >
                    <span
                      onClick={() => { navigate('folders'); setActiveTab(5); }}
                    >Folders</span></li>
                </ul>
            </div>
          </div>
        </div>

        <Outlet/>
      </section>
    </>
  );
}
export default Profile;