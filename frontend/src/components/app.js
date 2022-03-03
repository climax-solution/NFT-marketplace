import React, { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { createBrowserHistory } from "history";
import { createGlobalStyle } from 'styled-components';
import { NotificationContainer } from 'react-notifications';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from "react-redux";
import {  ThreeDots } from 'react-loader-spinner';
import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home from './pages/home';
import Explore from './pages/explore';
import Collection from './pages/collection';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/login';
import Register from './pages/register';
import Activity from './pages/activity';
import FolderItems from './pages/folderNFTs';
import Profile from './pages/Profile';
import NotFound from './components/404';

import 'react-toastify/dist/ReactToastify.css';
import 'react-notifications/lib/notifications.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import 'react-cool-music-player/dist/index.css'
// import 'react-country-dropdown/dist/index.css';

import { UPDATE_AUTH, UPDATE_LOADING_PROCESS } from '../store/action/auth.action';
import Loading from './components/Loading/Loading';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;
const history = createBrowserHistory();

const app = () => {
  const dispatch = useDispatch();

  const loadingProcessing = useSelector((state) => state.auth.isLoading);
  const userData = useSelector((state) => state.auth.user);

  useEffect(async() => {
    const jwtToekn = localStorage.getItem("nftdevelopments-token");
    dispatch(UPDATE_LOADING_PROCESS(true));
    if (jwtToekn) {
      await axios.post('http://nftdevelopments.co.nz/auth/check-authentication', {}, { headers :{ Authorization: JSON.parse(jwtToekn) } }).then(res => {
        const { data } = res;
        dispatch(UPDATE_LOADING_PROCESS(false));
        dispatch(UPDATE_AUTH(data ? data : {walletAddress: ''}));
      }).catch((err) => {
        dispatch(UPDATE_LOADING_PROCESS(false));
        dispatch(UPDATE_AUTH({
          walletAddress: ''
        }));
      })
    }

    else {
      dispatch(UPDATE_LOADING_PROCESS(false));
      dispatch(UPDATE_AUTH({
        walletAddress: ''
      }));
    }

  }, []);

  console.log(userData);
  if (loadingProcessing)
    return (
      <Loading/>
    )
  return (
    <div className="wraper">
      <GlobalStyles />
      <NotificationContainer/>
      <ToastContainer/>
        <Router history={history}>
          <Header/>
          <Routes>
              <Route path="*" element={<NotFound/>}/>
              <Route exact path="/" element={<Home/>}/>
              <Route path="/explore" element={<Explore/>}/>
              {/* <Route path="/helpcenter" element={<Helpcenter/>}/> */}
              {/* <Route path="/ranking" element={<Rangking/>}/> */}
              <Route path="/item-detail/:id" element={<ItemDetail/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              {/* <Route path="/create" element={<Create/>}/> */}
              <Route path="/activity" element={<Activity/>}/>
              {/* <Route path="/contact" element={<Contact/>}/> */}
              <Route path="/folder-explorer/:id" element={<FolderItems/>}/>
              <Route path={Object.keys(userData).length ? "/profile" : "/404"} element={Object.keys(userData).length ? <Profile/>: <NotFound/>}/>
              <Route path="/user/:username" element={<Collection/>}/>
          </Routes>
        </Router>
      <ScrollToTopBtn />
      
    </div>
  )
};
export default app;