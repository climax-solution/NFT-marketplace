import React, { useEffect, useState } from "react";
import { createGlobalStyle } from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import EmailValidator from 'email-validator';
import { NotificationManager } from "react-notifications";
import useOnclickOutside from "react-cool-onclickoutside";
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

  const [openMenu, setOpenMenu] = useState(true);
  const [openMenu1, setOpenMenu1] = useState(false);
  const [openMenu2, setOpenMenu2] = useState(false);
  const [openMenu3, setOpenMenu3] = useState(false);
  const [openChange, setOpenChange] = useState(false);

  const [isLoading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [web3, setWeb3] = useState({});
  const [NFT, setNFT] = useState({});
  const [Marketplace, setMarketplace] = useState({});
  const [sellingNFT, setSellingNFT] = useState([]);
  const [notSellingNFT, setNotSellingNFT] = useState([]);
  const [likedNFT, setLikedNFT] = useState({});
  const ref = useOnclickOutside(() => {
    setOpenChange(false);
  });

  const handleBtnClick = () => {
    setOpenMenu(true);
    setOpenMenu1(false);
    setOpenMenu2(false);
    setOpenMenu3(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById("Mainbtn3").classList.remove("active");
  };
  
  const handleBtnClick1 = () => {
    setOpenMenu1(true);
    setOpenMenu2(false);
    setOpenMenu(false);
    setOpenMenu3(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById("Mainbtn3").classList.remove("active");
  };

  const handleBtnClick2 = () => {
    setOpenMenu2(true);
    setOpenMenu(false);
    setOpenMenu1(false);
    setOpenMenu3(false);
    document.getElementById("Mainbtn2").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn3").classList.remove("active");
  };

  const handleBtnClick3 = () => {
    setOpenMenu3(true);
    setOpenMenu(false);
    setOpenMenu1(false);
    setOpenMenu2(false);
    document.getElementById("Mainbtn3").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
  };

  useEffect(async() => {
    const token = localStorage.getItem("nftdevelopments-token");
    const _headers = {headers: {Authorization: JSON.parse(token)}}
    if (token) {
      await axios.post('http://localhost:7060/user/get-user', {}, _headers).then(async(res) => {
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

  useEffect(() => {
    if (initUserData) setUserData(initUserData);
  },[initUserData])

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
        await fetchMetadata(final, 0);
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
      const token = localStorage.getItem("nftdevelopments-token");
      const _headers = {headers: {Authorization: JSON.parse(token)}}
      
      await axios.post("http://localhost:7060/user/get-liked-nfts", {}, _headers).then(async(res) => {
        const { liked } = res.data;
        const final = liked;
        if (liked.length > 8) final = liked.slice(0, 8);
        const list = [];
        for await(let item of final) {
          const _item = await Marketplace.methods.getItemNFT(item.tokenID).call();
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

  const updateAvatar = async(e) => {
    const files = e.target.files;
    const token = localStorage.getItem("nftdevelopments-token");
    if (files[0].type.indexOf("image") > -1) {
      let fileData = new FormData();
      fileData.append("myfile", files[0]);
      await axios.post(
        "http://localhost:7060/user/update-avatar",
        fileData,
        {
          headers: {
            Authorization: JSON.parse(token),
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(res => {
        dispatch(UPDATE_AUTH(res.data));
      }).catch(err => {

      })
    }
  }

  const updateUserInfo = async() => {
    const { firstName, lastName, email, password, confirmPassword } = userData;
    if (!firstName || !lastName || !EmailValidator.validate(email)) {
      NotificationManager.warning("You must input first name, last name, email correctly!");
      return;
    }

    if (!password || password && password !== confirmPassword) {
      NotificationManager.warning("Please confirm your password!");
      return;
    }

    await axios.post("http://localhost:7060/user/update-user", userData, _headers).then(res => {
      const { data } = res;
      dispatch(UPDATE_AUTH(data));
      NotificationManager.success("Updated profile successfully!");
    }).catch(err => {
      const { error } = err.response.data;
      NotificationManager.error(error);
    })
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
                      <div className="profile_avatar d-flex" ref={ref}>
                          <div
                            className="avatar-image position-relative w-50 overflow-hidden"
                            onMouseEnter={() => setOpenChange(true)}
                            onMouseLeave={() => setOpenChange(false)}
                          >
                            <img
                              src={`http://localhost:7060/avatar/${userData.avatar ? userData.avatar : "empty-avatar.png"}`}
                              className="position-absolute index-avatar"
                              alt=""
                              crossOrigin="true"
                              />
                            { openChange &&
                              <label className="avatar-change">
                                <i className="fa fa-edit edit-btn m-0 d-inline-block"/>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={updateAvatar}
                                  hidden
                                />
                              </label>
                            }
                          </div>
                          <div className="profile_name w-50">
                              {
                                Object.keys(userData).length &&
                                <h4>
                                    {`${userData.firstName}  ${userData.lastName}`}
                                    <span className="profile_username">@{userData.username}</span>
                                    <span id="wallet" className="profile_wallet">{userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                                    <button id="btn_copy" className="ml-12" title="Copy Text">Copy</button>
                                </h4>
                              }
                          </div>
                      </div>
                  </div>
                  {/* <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                          <div className="profile_follower">500 followers</div>
                      </div>
                      <div className="de-flex-col">
                          <span className="btn-main">Follow</span>
                      </div>
                  </div> */}

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
                    <li id='Mainbtn3' className=""><span onClick={handleBtnClick3}>User Info</span></li>
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
              <ColumnZero
                data={sellingNFT}
                _web3={web3}
                _insNFT={NFT}
                _insMarketplace={Marketplace}
              />
              </div>
            ))
        }
        {
          !isLoading &&
            (openMenu1 && (
              <div id='zero2' className='onStep fadeIn'>
              <ColumnZeroTwo
                data={notSellingNFT}
                _web3={web3}
                _insNFT={NFT}
                _insMarketplace={Marketplace}/>
              </div>
            ))
        }
        {
          !isLoading &&
            (openMenu2 && (
              <div id='zero3' className='onStep fadeIn'>
              <ColumnZeroThree
                data={likedNFT}
                _web3={web3}
                _insNFT={NFT}
                _insMarketplace={Marketplace}
              />
              </div>
            ))
        }

        {
          !isLoading &&
            (
              openMenu3 && Object.keys(userData).length && (
              <div id='zero4' className='onStep fadeIn'>
                <div id="form-create-item" className="form-border row justify-content-center" action="#">
                  <div className="field-set col-md-8 mg-auto p-4 user-info">
                      <div className="spacer-single"></div>
                      <div className="row">
                        <div className="col-md-6 col-12">
                          <span>First Name</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your first name"
                            value={userData.firstName}
                            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Last Name</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your last name"
                            value={userData.lastName}
                            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Email</span>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Please enter your email address"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Facebook</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your facebook profile link"
                            value={userData.facebook}
                            onChange={(e) => setUserData({ ...userData, facebook: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Instagram</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your instagram profile link"
                            value={userData.instagram}
                            onChange={(e) => setUserData({ ...userData, instagram: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Twitter</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your twitter profile link"
                            value={userData.twitter}
                            onChange={(e) => setUserData({ ...userData, twitter: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>LinkedIn</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your linkedin profile link"
                            value={userData.linkedin}
                            onChange={(e) => setUserData({ ...userData, linkedin: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Tik tok</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please enter your tiktok profile link"
                            value={userData.tiktok}
                            onChange={(e) => setUserData({ ...userData, tiktok: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Password</span>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Please enter your password"
                            value={userData.password}
                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 col-12">
                          <span>Confirm Password</span>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Please confirm password"
                            value={userData.confirmPassword}
                            onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                      <input
                        type="button"
                        id="submit"
                        className="btn-main"
                        value="Update profile"
                        onClick={updateUserInfo}
                      />
                  </div>
                </div>
              </div>
              )
            )
        }
      </section>

      <Footer />
    </div>
  );
}
export default Profile;