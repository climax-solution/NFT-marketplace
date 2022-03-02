import React, { useEffect, useState, lazy, Suspense } from "react";
import { createGlobalStyle } from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useOnclickOutside from "react-cool-onclickoutside";
import getWeb3 from "../../utils/getWeb3";
import { UPDATE_AUTH } from "../../store/action/auth.action";
import Avatar from "../components/Profile/avatar";
import UserInfo from "../components/Profile/userInfo";
import ManageInfo from "../components/Profile/manageInfo";

const SellingNFT = lazy(() => import('../components/SellingNFT'));
const NotSellingNFT = lazy(() => import('../components/NotSellingNFT'));
const Loading = lazy(() => import("../components/Loading/Loading"));
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
`;

const Profile = function() {

  const initUserData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [web3, setWeb3] = useState({});
  const [NFT, setNFT] = useState({});
  const [Marketplace, setMarketplace] = useState({});
  const [sellingNFT, setSellingNFT] = useState([]);
  const [notSellingNFT, setNotSellingNFT] = useState([]);

  const [sellUpdated, setSellUpdated] = useState(false);
  const [notSellUpdated, setNotSellUpdated] = useState(false);

  const ref = useOnclickOutside(() => {
  });

  useEffect(async() => {
    const token = localStorage.getItem("nftdevelopments-token");
    const _headers = {headers: {Authorization: JSON.parse(token)}}
    if (token) {
      await axios.post('http://nftdevelopments.co.nz/user/get-user', {}, _headers).then(async(res) => {
        dispatch(UPDATE_AUTH(res.data));
        const { _web3, instanceNFT, instanceMarketplace } = await getWeb3();
        setWeb3(_web3);
        setNFT(instanceNFT);
        setMarketplace(instanceMarketplace);
      }).catch(err => {
        setLoading(false);
      })
    }
  },[]);

  useEffect(async() => {
    if (Object.keys(initUserData).length && Marketplace) {
      setLoading(true);
      switch(activeTab) {
        case 0:
          try {
            let list = await Marketplace.methods.getPersonalNFTList().call({ from: initUserData.walletAddress });
            list = list.filter(item => item.marketData.existance && item.marketData.marketStatus);
            setSellingNFT(list);
          } catch(err) {
            console.log(err);
            setLoading(false);
          }
          break;
        case 1:
          try {
            let list = await Marketplace.methods.getPersonalNFTList().call({ from: initUserData.walletAddress });
            list = list.filter(item => item.marketData.existance && !item.marketData.marketStatus);
            setNotSellingNFT(list);
          } catch(err) {
            console.log(err);
            setLoading(false);
          }
          break;
        default:
          break;
      }
      setLoading(false);
    }
  },[Marketplace, activeTab, sellUpdated, notSellUpdated]);  

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <GlobalStyles/>

        <section className='container no-bottom'>
          <div className='row'>
            <div className='spacer-double'></div>
            <div className="col-md-12">
              <div className="d_profile de-flex">
                <div className="de-flex-col">
                    <div className="profile_avatar d-flex" ref={ref}>
                        <Avatar/>
                        <UserInfo/>
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
                  <ul className="de_nav text-left">
                      <li id='Mainbtn' className={activeTab == 0 ? 'active' : ''}><span onClick={() => setActiveTab(0)}>On Sale</span></li>
                      <li id='Mainbtn1' className={activeTab == 1 ? 'active' : ''}><span onClick={() => setActiveTab(1)}>Not Sale</span></li>
                      <li id='Mainbtn3' className={activeTab == 3 ? 'active' : ''}><span onClick={() => setActiveTab(3)}>User Info</span></li>
                  </ul>
              </div>
            </div>
          </div>
          {
            isLoading && <Loading/>
          }

          {
            !isLoading &&
              (activeTab == 0 && (
                <div id='zero1' className='onStep fadeIn'>
                <SellingNFT
                  data={sellingNFT}
                  _web3={web3}
                  _insNFT={NFT}
                  _insMarketplace={Marketplace}
                  updateStatus={setSellUpdated}
                  status={sellUpdated}
                />
                </div>
              ))
          }
          {
            !isLoading &&
              (activeTab == 1  && (
                <div id='zero2' className='onStep fadeIn'>
                  <NotSellingNFT
                    data={notSellingNFT}
                    _web3={web3}
                    _insNFT={NFT}
                    _insMarketplace={Marketplace}
                    updateStatus={setNotSellUpdated}
                    status={notSellUpdated}
                  />
                </div>
              ))
          }

          {
            !isLoading &&
              (
                activeTab == 3 && <ManageInfo/>
              )
          }
        </section>

        <Footer />
      </Suspense>
    </div>
  );
}
export default Profile;