import React, { useEffect, useState, Fragment } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { createGlobalStyle } from 'styled-components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link, useNavigate } from 'react-router-dom';
import useOnclickOutside from "react-cool-onclickoutside";
import { NotificationManager } from "react-notifications";
import { useSelector, useDispatch } from "react-redux";
import { UPDATE_AUTH } from "../../store/action/auth.action";
import getWeb3 from "../../utils/getWeb3";
import { WalletConnect } from "../../store/action/wallet.action";

const GlobalStyles = createGlobalStyle`
  .navbar {
    .light-logo {
      width: 100px;
      height: 70px;
    }
    .mainside{
      .connect-wal{
        display: none;
      }
      .logout{
        display: flex !important;
        align-items: center;
        position: relative;
        .item-dropdown a{
          display: block;
        }
        .index-avatar {
          aspect-ratio: 1;
        }
        .dropdown-toggle {
          text-align: center;
          color: #fff !important;
          border-radius: 6px;
          letter-spacing: normal;
          outline: 0;
          font-weight: 800;
          text-decoration: none;
          padding: 6px 11px !important;
          font-size: 18px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 2px 2px 20px 0px rgba(131,100,226, 0);
          transition: all 0.3s ease;
          &:hover{
            box-shadow: 2px 2px 20px 0px rgba(131,100,226, 0.5);
            transition: all 0.3s ease;
          }
        }
        .dropdown-toggle::after {
          content: "";
        }
      }
      .font-bold {
        font-weight: 900;
      }
    }
  }
  .btn-main {
    padding: 6px 20px;
  }
`;

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const Header= function() {

    const user_data = useSelector(({auth}) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);
    const dispatch = useDispatch();

    const [ethBalance, setETHBalance] = useState(0);
    const [userData, setUserData] = useState({});
    const [openMenu, setOpenMenu] = useState(false);
    const navigate = useNavigate();

    const closeMenu = () => {
      setOpenMenu(false);
    };

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
          } if (window.pageYOffset > sticky) {
            closeMenu();
          }
        });
        return () => {
          window.removeEventListener("scroll", scrollCallBack);
        };
    }, []);
    

    useEffect(async() => {
      setUserData(user_data);
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

        provider.on("chainChanged", (chainID) => {
          if (chainID != '0x3') {
            localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
          }
          else {
            localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: true }));
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
    
    const copyAlert = () => NotificationManager.info("Copied");

    const connectWallet = async() => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if ((accounts[0]).toLowerCase() != (user_data.walletAddress).toLowerCase()) throw new Error("Please connect correct account");
        else {
          localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: true }));
          dispatch(WalletConnect());
          NotificationManager.success("Connected");
        }
      } catch(err) {
        NotificationManager.error(err.message);
      }
    }

    const disConnectWallet = () => {
      localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
      dispatch(WalletConnect());
      NotificationManager.info("Disconnected");
    }

    return (
      <Fragment>
        <GlobalStyles/>
          <header id="myHeader" className='navbar white'>
            <div className='container'>
              <div className='row w-100-nav'>
                  <div className='logo px-0'>
                      <div className='navbar-title navbar-item'>
                        <Link to="/">
                          <img
                            src="/img/logo-light.png"
                            className="img-fluid d-block light-logo"
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
                          {
                            !user_data?.walletAddress && (
                              <>
                              <div className='navbar-item'>
                                <Link to="/login" onClick={() => btn_icon(!showmenu)}>
                                Login
                                  <span className='lines'></span>
                                </Link>
                              </div>
                              <div className='navbar-item'>
                                <Link to="/register" onClick={() => btn_icon(!showmenu)}>
                                Register
                                  <span className='lines'></span>
                                </Link>
                              </div>
                              </>
                            )
                          }
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
                        {
                          !user_data?.walletAddress && (
                            <>
                            <div className='navbar-item'>
                              <Link to="/login" onClick={() => btn_icon(!showmenu)}>
                              Login
                                <span className='lines'></span>
                              </Link>
                            </div>
                            <div className='navbar-item'>
                              <Link to="/register" onClick={() => btn_icon(!showmenu)}>
                              Register
                                <span className='lines'></span>
                              </Link>
                            </div>
                            </>
                          )
                        }
                      </div>
                    </Breakpoint>
                  </BreakpointProvider>

                  <div className='mainside d-flex align-items-center'>
                    { user_data?.walletAddress && 
                      <span className="btn-main" onClick={ !wallet_info ? connectWallet : disConnectWallet }>{ !wallet_info ? "Connect Wallet" : "Disconnect Wallet"
                    } </span>
                    }
                    <div className="logout">
                      { user_data?.walletAddress &&
                        <div id="de-click-menu-profile" className="de-menu-profile" onClick={() => btn_icon_pop(!showpop)} ref={refpop}>                           
                            <img src={`http://nftdevelopments.co.nz/avatar/${userData.avatar ? userData.avatar : "empty-avatar.png"}`}  alt="" crossOrigin="true" className="index-avatar"/>
                            {showpop && 
                              <div className="popshow">
                                <div className="d-name">
                                    <h3 className="text-black">{userData.firstName + " " + userData.lastName }</h3>
                                </div>
                                <div className="d-balance">
                                    <h4 className="text-black">Balance</h4>
                                    <span className="font-bold">{ethBalance}</span> ETH
                                </div>
                                <div className="d-wallet">
                                    <h4 className="text-black">My Wallet</h4>
                                    <span id="wallet" className="d-wallet-address font-bold">{ userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                                    <CopyToClipboard text={userData.walletAddress}
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
                                  <li>
                                    <span onClick={logout}>
                                      <i className="fa fa-sign-out"></i> Sign out
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
      </Fragment>
    );
}
export default Header;