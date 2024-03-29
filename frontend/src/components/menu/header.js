import React, { useEffect, useState } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link, useNavigate } from 'react-router-dom';
import useOnclickOutside from "react-cool-onclickoutside";
import { useSelector, useDispatch } from "react-redux";
import { UPDATE_AUTH } from "../../store/action/auth.action";
import Web3 from  'web3';
import { createGlobalStyle } from "styled-components";
import getWeb3 from "../../utils/getWeb3";
import { warning_toastify, success_toastify, info_toastify } from "../../utils/notify";
import { failedLoadImage, shorten } from "../../utils/compre.js";
import { WalletConnect } from "../../store/action/wallet.action";
import style from "./style.js";
import axios from "axios";
import { authSign } from "../../utils/sign";

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const GlobalStyle = createGlobalStyle`${style}`;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user_data = useSelector(({auth}) => auth.user);
  const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

  const [ethBalance, setETHBalance] = useState(0);
  const [showmenu, btn_icon] = useState(false);
  const [showpop, btn_icon_pop] = useState(false);

  const closePop = () => {
    btn_icon_pop(false);
  };
  const refpop = useOnclickOutside(() => {
    closePop();
  });

  useEffect(async() => {
    const header = document.getElementById("myHeader");
    const totop = document.getElementById("scroll-to-top");
    const sticky = header.offsetTop;
    const scrollCallBack = window.addEventListener("scroll", () => {
        btn_icon(false);
        if (window.pageYOffset > sticky) {
          header.classList.add("sticky");
          totop.classList.add("show");
          
        } else {
          header.classList.remove("sticky");
          totop.classList.remove("show");
        }
      });
      return () => {
        window.removeEventListener("scroll", scrollCallBack);
      };
  }, []);
  

  useEffect(async() => {
    if (user_data?.walletAddress) {
      const { _web3 } = await getWeb3();
      let balance = await _web3.eth.getBalance(user_data.walletAddress);
      let accounts = await _web3.eth.getAccounts();
      if (!accounts.length || (accounts[0]).toLowerCase() != (user_data?.walletAddress).toLowerCase()) {
        localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
        dispatch(WalletConnect());
      }
      else {
        const { connected } = JSON.parse(localStorage.getItem("nftdevelopments-connected"));
        if (connected) dispatch(WalletConnect());
      }
      balance = _web3.utils.fromWei(balance, "ether");
      let diver = balance.indexOf('.') + 5;
      balance = balance.slice(0, diver);
      setETHBalance(balance);
    }
  },[user_data])

  useEffect(() => {
    if (window.ethereum) {
      const provider = window.ethereum;
      provider.on("accountsChanged", async(accounts) => {
        if (!accounts.length || (accounts[0]).toLowerCase() != (user_data?.walletAddress).toLowerCase()) {
          localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
        }
        else {
          const { _web3 } = await getWeb3();
          let balance = await _web3.eth.getBalance(user_data.walletAddress);
          balance = _web3.utils.fromWei(balance, "ether");
          let diver = balance.indexOf('.') + 5;
          balance = balance.slice(0, diver);
          setETHBalance(balance);
          localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: true }));
        }
        dispatch(WalletConnect());
      })

      provider.on("chainChanged", async(chainID) => {
        if (chainID != '0x38') {
          localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
        }
        else {
          await connectWallet();
        }
        dispatch(WalletConnect());
      })
    }
  },[user_data, ])

  const logout = () => {
    localStorage.removeItem("nftdevelopments-token");
    localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
    dispatch(UPDATE_AUTH({ walletAddress: '' }));
    dispatch(WalletConnect());
    navigate('/');
  }
  
  const copyAlert = () => {
    info_toastify('Copied');
  }

  const connectWallet = async() => {
    try {
      const _web3 = new Web3(window.ethereum);
      const chainID = await _web3.eth.getChainId();
      if (chainID != '0x38') {
        throw Error('Please switch to BSC testnet');
      };

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _existed = await axios.post(
        `${process.env.REACT_APP_BACKEND}user/get-user`,
        { walletAddress: accounts[0] }
      ).then(res => {
        dispatch(UPDATE_AUTH(res.data));
        return true;
      }).catch(err => { return false; });

      if (!_existed) {
        const authSignature = await authSign(accounts[0], 'register');
        await axios.post(`${process.env.REACT_APP_BACKEND}auth/register`, {
          walletAddress: accounts[0],
          signature: authSignature,
          action: "register"
        }).then(async(res) => {
          const { user } = res.data;
            dispatch(UPDATE_AUTH(user));
        }).catch(err => {

        });
      }
      // console.log(accounts, user_data.walletAddress);
      // if ((accounts[0]).toLowerCase() != (user_data.walletAddress).toLowerCase()) throw new Error("Please switch account and connect.");
      // else {
        localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: true }));
        dispatch(WalletConnect());
        success_toastify('Connected');
      // }
    } catch(err) {
      let message = "";
      if (!window.ethereum) {
        message = 'Please install metamask';
      }
      else {
        if (err.code === -32002) {
          message = 'Please check your metamask. You have already requested';
        }
        else if (err.code === 4001) {
          message = 'Connecting cancelled';
        }

        else {
          message = err.message;
        }
        warning_toastify(message);
      }
    }
  }

  const disConnectWallet = () => {
    localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
    dispatch(WalletConnect());
    dispatch(UPDATE_AUTH({ walletAddress: '' }));
    info_toastify('Disconnected');
  }

  return (
    <>
      <GlobalStyle/>
        <header id="myHeader" className='navbar white'>
          <div className='container'>
            <div className='row w-100-nav'>
                <div className='logo px-0'>
                    <div className='navbar-title navbar-item'>
                      <Link to="/">
                        <img
                          src="/img/logo-light.png"
                          className="img-fluid d-block light-logo"
                          onError={failedLoadImage}
                          alt="#"
                        />
                      </Link>
                    </div>
                </div>
                          
                <BreakpointProvider>
                  <Breakpoint l down>
                    {showmenu && 
                      <div className='menu'>
                        <div className='navbar-item'>
                          <Link to="/" onClick={() => btn_icon(!showmenu)}>
                            Home
                            <span className='lines'></span>
                          </Link>
                        </div>
                        <div className='navbar-item'>
                          <Link to="/explore" onClick={() => btn_icon(!showmenu)}>
                            Explore
                            <span className='lines'></span>
                          </Link>
                        </div>
                        <div className='navbar-item'>
                          <Link to="/activity" onClick={() => btn_icon(!showmenu)}>
                            Activity
                            <span className='lines'></span>
                          </Link>
                        </div>
                        <div className='navbar-item'>
                          <Link to="/users" onClick={() => btn_icon(!showmenu)}>
                            Users
                            <span className='lines'></span>
                          </Link>
                        </div>
                      </div>
                    }
                  </Breakpoint>

                  <Breakpoint xl>
                    <div className='menu'>
                      <div className='navbar-item'>
                        <Link to="/" onClick={() => btn_icon(!showmenu)}>
                          Home
                          <span className='lines'></span>
                        </Link>
                      </div>
                      <div className='navbar-item'>
                        <Link to="/explore" onClick={() => btn_icon(!showmenu)}>
                          Explore
                          <span className='lines'></span>
                        </Link>
                      </div>
                      <div className='navbar-item'>
                        <Link to="/activity" onClick={() => btn_icon(!showmenu)}>
                          Activity
                          <span className='lines'></span>
                        </Link>
                      </div>
                      <div className='navbar-item'>
                        <Link to="/users" onClick={() => btn_icon(!showmenu)}>
                          Users
                          <span className='lines'></span>
                        </Link>
                      </div>
                    </div>
                  </Breakpoint>
                </BreakpointProvider>

                <div className='mainside d-flex align-items-center'>
                  <span className="btn-main cursor-pointer" onClick={ !wallet_info ? connectWallet : disConnectWallet }>{ !wallet_info ? "Connect Wallet" : "Disconnect Wallet" } </span>
                  <div className="logout">
                    { user_data?.walletAddress &&
                      <div id="de-click-menu-profile" className="de-menu-profile" onClick={() => btn_icon_pop(!showpop)} ref={refpop}>                           
                          <img src={`${process.env.REACT_APP_BACKEND}avatar/${user_data.avatar ? user_data.avatar : "empty-avatar.png"}`} onError={failedLoadImage}  alt="" crossOrigin="true" className="index-avatar"/>
                          {showpop && 
                            <div className="popshow">
                              <div className="d-name">
                                  <h3 className="text-black">{user_data.name ? user_data.name : "Unamed"}</h3>
                              </div>
                              <div className="d-balance">
                                  <h4 className="text-black">Balance</h4>
                                  <span className="font-bold">{ethBalance}</span> BNB
                              </div>
                              <div className="d-wallet">
                                  <h4 className="text-black">My Wallet</h4>
                                  <span id="wallet" className="d-wallet-address font-bold">{ user_data.walletAddress && shorten(user_data.walletAddress)}</span>
                                  <CopyToClipboard text={user_data.walletAddress}
                                    onCopy={copyAlert}>
                                    <button id="btn_copy">Copy</button>
                                  </CopyToClipboard>
                              </div>
                              <div className="d-line"></div>
                              <ul className="de-submenu-profile">
                                <li>
                                  <span>
                                    <Link to="/profile" className="text-black">
                                      <i className="fa fa-user"></i> My profile
                                    </Link>
                                  </span>
                                </li>
                              </ul>
                            </div>
                          }
                      </div>
                    }
                  </div>
                </div>
                        
            </div>

              <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
                <div className="menu-line white"></div>
                <div className="menu-line1 white"></div>
                <div className="menu-line2 white"></div>
              </button>

          </div>
        </header>
    </>
  );
}
export default Header;