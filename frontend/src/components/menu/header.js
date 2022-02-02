import React, { useEffect, useState, Fragment } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { createGlobalStyle } from 'styled-components';
import { header } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import useOnclickOutside from "react-cool-onclickoutside";
import { useSelector, useDispatch } from "react-redux";
import StyledHeader from "../Styles";
import { UPDATE_AUTH } from "../../store/action/auth.action";
import axios from "axios";

const GlobalStyles = createGlobalStyle`
  .navbar {
    .light-logo {
      width: 100px !important;
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
      
    }
  }
`;

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const Header= function() {

    const user_data = useSelector(({auth}) => auth.user)
    const dispatch = useDispatch();

    const [openMenu, setOpenMenu] = React.useState(false);
    const [openMenu1, setOpenMenu1] = React.useState(false);
    const [openMenu2, setOpenMenu2] = React.useState(false);
    const [openMenu3, setOpenMenu3] = React.useState(false);
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    const handleBtnClick = (): void => {
      setOpenMenu(!openMenu);
    };
    const handleBtnClick1 = (): void => {
      setOpenMenu1(!openMenu1);
    };
    const handleBtnClick2 = (): void => {
      setOpenMenu2(!openMenu2);
    };
    const handleBtnClick3 = (): void => {
      setOpenMenu3(!openMenu3);
    };
    const closeMenu = (): void => {
      setOpenMenu(false);
    };
    const closeMenu1 = (): void => {
      setOpenMenu1(false);
    };
    const closeMenu2 = (): void => {
      setOpenMenu2(false);
    };
    const closeMenu3 = (): void => {
      setOpenMenu3(false);
    };
    const ref = useOnclickOutside(() => {
      closeMenu();
    });
    const ref1 = useOnclickOutside(() => {
      closeMenu1();
    });
    const ref2 = useOnclickOutside(() => {
      closeMenu2();
    });
    const ref3 = useOnclickOutside(() => {
      closeMenu3();
    });

    const [showmenu, btn_icon] = useState(false);
    const [showpop, btn_icon_pop] = useState(false);
    const [shownot, btn_icon_not] = useState(false);
    const closePop = () => {
      btn_icon_pop(false);
    };
    const closeNot = () => {
      btn_icon_not(false);
    };
    const refpop = useOnclickOutside(() => {
      closePop();
    });
    const refpopnot = useOnclickOutside(() => {
      closeNot();
    });

    useEffect(() => {
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
      const token = localStorage.getItem("nftdevelopments-token");
      if (token) {
        await axios.post('http://localhost:7060/user/get-user', {}, {headers: {Authorization: JSON.parse(token)}}).then((res) => {
          dispatch(UPDATE_AUTH(res.data));
          setUserData(res.data);
        }).then((err) => {
        });
      } else {
        dispatch(UPDATE_AUTH({}))
      }
    },[])

    const logout = () => {
      localStorage.removeItem("nftdevelopments-token");
      dispatch(UPDATE_AUTH({}));
      navigate('/');
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
                          <img
                            src="/img/logo-light.png light-logo"
                            className="img-fluid d-3"
                            alt="#"
                          />
                          <img
                            src="/img/logo-light.png"
                            className="img-fluid d-none light-logo"
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
                          <Link to="/">
                            Home
                            <span className='lines'></span>
                          </Link>
                        </div>
                        <div className='navbar-item'>
                          <div ref={ref1}>
                            <div className="dropdown-custom dropdown-toggle btn" 
                              onClick={handleBtnClick1}
                              >
                              Explore
                            </div>
                            {openMenu1 && (
                              <div className='item-dropdown'>
                                <div className="dropdown" onClick={closeMenu1}>
                                  <Link to="/explore" onClick={() => btn_icon(!showmenu)}>Explore</Link>
                                  <Link to="/explore2" onClick={() => btn_icon(!showmenu)}>Explore 2</Link>
                                  <Link to="/rangking" onClick={() => btn_icon(!showmenu)}>Rangking</Link>
                                  <Link to="/colection" onClick={() => btn_icon(!showmenu)}>Collection</Link>
                                  <Link to="/ItemDetail" onClick={() => btn_icon(!showmenu)}>Items Details</Link>
                                  <Link to="/Auction" onClick={() => btn_icon(!showmenu)}>Live Auction</Link>
                                  <Link to="/helpcenter" onClick={() => btn_icon(!showmenu)}>Help Center</Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='navbar-item'>
                          <div ref={ref2}>
                            <div className="dropdown-custom dropdown-toggle btn" 
                              onClick={handleBtnClick2}
                              >
                              Pages
                            </div>
                            {openMenu2 && (
                              <div className='item-dropdown'>
                                <div className="dropdown" onClick={closeMenu2}>
                                  <Link to="/Author" onClick={() => btn_icon(!showmenu)}>Author</Link>
                                  <Link to="/wallet" onClick={() => btn_icon(!showmenu)}>Wallet</Link>
                                  <Link to="/create" onClick={() => btn_icon(!showmenu)}>Create</Link>
                                  <Link to="/news" onClick={() => btn_icon(!showmenu)}>News</Link>
                                  <Link to="/works" onClick={() => btn_icon(!showmenu)}>Gallery</Link>
                                  <Link to="/login" onClick={() => btn_icon(!showmenu)}>login</Link>
                                  <Link to="/loginTwo" onClick={() => btn_icon(!showmenu)}>login 2</Link>
                                  <Link to="/register" onClick={() => btn_icon(!showmenu)}>Register</Link>
                                  <Link to="/contact" onClick={() => btn_icon(!showmenu)}>Contact Us</Link>
                                </div>
                              </div>
                            )}
                          </div>
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
                          <div ref={ref2}>
                              <div className="dropdown-custom dropdown-toggle btn" 
                                onMouseEnter={handleBtnClick2} onMouseLeave={closeMenu2}>
                                Pages
                                <span className='lines'></span>
                                {openMenu2 && (
                                <div className='item-dropdown'>
                                  <div className="dropdown" onClick={closeMenu2}>
                                  <Link to="/Author">Author</Link>
                                  <Link to="/wallet">Wallet</Link>
                                  <Link to="/create">Create</Link>
                                  <Link to="/news">News</Link>
                                  <Link to="/works">Gallery</Link>
                                  <Link to="/login">login</Link>
                                  <Link to="/loginTwo">login 2</Link>
                                  <Link to="/register">Register</Link>
                                  <Link to="/contact">Contact Us</Link>
                                  </div>
                                </div>
                              )}
                              </div>
                            </div>
                        </div>
                        {
                          !Object.keys(user_data).length && (
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

                  <div className='mainside'>
                    <div className="logout">
                      {Object.keys(user_data).length &&
                        <div id="de-click-menu-profile" className="de-menu-profile" onClick={() => btn_icon_pop(!showpop)} ref={refpop}>                           
                            <img src={`http://localhost:7060/avatar/${userData.avatar ? userData.avatar : "empty-avatar.png"}`}  alt="" crossOrigin="true" className="index-avatar"/>
                            {showpop && 
                              <div className="popshow">
                                <div className="d-name">
                                    <h4>Monica Lucas</h4>
                                    <span className="name" onClick={()=> window.open("", "_self")}>Set display name</span>
                                </div>
                                <div className="d-balance">
                                    <h4>Balance</h4>
                                    12.858 ETH
                                </div>
                                <div className="d-wallet">
                                    <h4>My Wallet</h4>
                                    <span id="wallet" className="d-wallet-address">{ userData.walletAddress && ((userData.walletAddress).substr(0, 4) + '...' + (userData.walletAddress).substr(-4))}</span>
                                    <button id="btn_copy" title="Copy Text">Copy</button>
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
                                    <span>
                                      <i className="fa fa-pencil"></i> Edit profile
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