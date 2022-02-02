import React, { useEffect, useState } from "react";
import { createGlobalStyle } from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import ColumnZero from '../components/ColumnZero';
import ColumnZeroTwo from '../components/ColumnZeroTwo';
import ColumnZeroThree from '../components/ColumnZeroThree';
import Loading from "../components/Loading";
import Footer from '../components/footer';
import getWeb3 from "../../utils/getWeb3";
import { UPDATE_AUTH } from "../../store/action/auth.action";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
  .ml-12 {
    margin-left: 12px;
  }
`;

const token = localStorage.getItem("nftdevelopments-token");

const _headers = {headers: {Authorization: JSON.parse(token)}}

const Profile= function() {

  const initUserData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState(true);
  const [openMenu1, setOpenMenu1] = useState(false);
  const [openMenu2, setOpenMenu2] = useState(false);

  const [isLoading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [web3, setWeb3] = useState({});
  const [NFT, setNFT] = useState({});
  const [Marketplace, setMarketplace] = useState({});
  const [sellingNFT, setSellingNFT] = useState([]);
  const [notSellingNFT, setNotSellingNFT] = useState([]);
  const [likedNFT, setLikedNFT] = useState({});

  const handleBtnClick = (): void => {
    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    setOpenMenu2(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
  };
  const handleBtnClick1 = (): void => {
    setOpenMenu1(!openMenu1);
    setOpenMenu2(false);
    setOpenMenu(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
  };
  const handleBtnClick2 = (): void => {
    setOpenMenu2(!openMenu2);
    setOpenMenu(false);
    setOpenMenu1(false);
    document.getElementById("Mainbtn2").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn1").classList.remove("active");
  };

  useEffect(async() => {
    if (token) {
      await axios.post('http://localhost:7060/user/get-user', {}, _headers).then(async(res) => {
        setUserData(res.data);
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
    if (Object.keys(userData).length && Marketplace && openMenu) {
      setLoading(true);
      try {
        let list = await Marketplace.methods.getPersonalNFTList().call({ from: userData.walletAddress });
        list = list.filter(item => item.marketData.existance && item.marketData.marketStatus);
        let final = list;
        if (list.length > 8) {
          final = list.slice(0, 8);
        }
        await fetchMetadata(list, 0);
      } catch(err) {
        setLoading(false);
      }
    }
  },[Marketplace, openMenu]);

  useEffect(async() => {
    if (Object.keys(userData).length && Marketplace && openMenu1) {
      setLoading(true);
      try {
        let list = await Marketplace.methods.getPersonalNFTList().call({ from: userData.walletAddress });
        list = list.filter(item => item.marketData.existance && !item.marketData.marketStatus);
        let final = list;
        if (list.length > 8) {
          final = list.slice(0, 8);
        }
        await fetchMetadata(final, 1);
      } catch(err) {
        setLoading(false);
      }
    }
  },[Marketplace, openMenu1]);

  useEffect(async() => {
    if (Object.keys(userData).length && Marketplace && openMenu2) {
      setLoading(true);
      await axios.post("http://localhost:7060/user/get-liked-nfts", {}, _headers).then(async(res) => {
        const { liked } = res.data;
        const final = liked;
        if (liked.length > 8) final = liked.slice(0, 8);
        const list = [];
        for await(let item of final) {
          const _item = await Marketplace.methods.getPhoto(item.tokenID).call();
          list.push(_item);
        }

        await fetchMetadata(list, 2);

      }).catch(err => {
        setLoading(false);
      })
    }
  }, [openMenu2])

  const fetchMetadata = async(list, status) => {
    let mainList = [];
    for await (let item of list) {
      try {
        const {data} = await axios.get(item.nftData.tokenURI);
        mainList.push({ ...item, ...data});
      } catch(err) {

      }
    }
    if (!status) setSellingNFT(mainList);
    else if (status == 1) setNotSellingNFT(mainList);
    else setLikedNFT(mainList);
    setLoading(false);
  }

  return (
    <div>
    <GlobalStyles/>

      <section className='container no-bottom'>
        <div className='row'>
          <div className='spacer-double'></div>
          <div className="col-md-12">
            <div className="d_profile de-flex">
                  <div className="de-flex-col">
                      <div className="profile_avatar">
                          <img src={userData.avatar ? userData.avatar : "/img/empty-avatar.png"} alt=""/>
                          <i className="fa fa-check"></i>
                          <div className="profile_name">
                              {
                                Object.keys(userData).length &&
                                <h4>
                                    {`${userData.firstName}  ${userData.lastName}`}
                                    <span className="profile_username">@{userData.username}</span>
                                    <span id="wallet" className="profile_wallet">{(userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4)}</span>
                                    <button id="btn_copy" className="ml-12" title="Copy Text">Copy</button>
                                </h4>
                              }
                          </div>
                      </div>
                  </div>
                  <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                          <div className="profile_follower">500 followers</div>
                      </div>
                      <div className="de-flex-col">
                          <span className="btn-main">Follow</span>
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
                    <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>On Sale</span></li>
                    <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Not Sale</span></li>
                    <li id='Mainbtn2' className=""><span onClick={handleBtnClick2}>Liked</span></li>
                </ul>
            </div>
          </div>
        </div>
        {
          isLoading && <Loading/>
        }

        {
          !isLoading &&
            (openMenu && (
              <div id='zero1' className='onStep fadeIn'>
              <ColumnZero data={sellingNFT} _web3={web3}/>
              </div>
            ))
        }
        {
          !isLoading &&
            (openMenu1 && (
              <div id='zero2' className='onStep fadeIn'>
              <ColumnZeroTwo data={notSellingNFT} _web3={web3}/>
              </div>
            ))
        }
        {
          !isLoading &&
            (openMenu2 && (
              <div id='zero3' className='onStep fadeIn'>
              <ColumnZeroThree data={likedNFT} _web3={web3}/>
              </div>
            ))
        }
      </section>


      <Footer />
    </div>
  );
}
export default Profile;