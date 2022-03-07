import React, { lazy, Suspense, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { createBrowserHistory } from "history";
import { createGlobalStyle } from 'styled-components';
import { NotificationContainer } from 'react-notifications';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from "react-redux";
import ScrollToTopBtn from './menu/ScrollToTop';

const Header = lazy(() => import('./menu/header'));
const Home = lazy(() => import('./pages/home'));
const Explore = lazy(() => import('./pages/explore'));
const Collection = lazy(() => import('./pages/collection'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Login = lazy(() => import('./pages/login'));
const Register = lazy(() => import('./pages/register'));
const ForgotPassword = lazy(() => import('./pages/forgotPassword'));
const ResetPassword = lazy(() => import('./pages/resetPassword'));
const Activity = lazy(() => import('./pages/activity'));
const FolderItems = lazy(() => import('./pages/folderNFTs'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./components/404'));

import 'react-toastify/dist/ReactToastify.css';
import 'react-notifications/lib/notifications.css';
import 'react-cool-music-player/dist/index.css'

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
    const jwtToken = localStorage.getItem("nftdevelopments-token");
    dispatch(UPDATE_LOADING_PROCESS(true));
    if (jwtToken) {
      await axios.post('http://nftdevelopments.co.nz/auth/check-authentication', {}, { headers :{ Authorization: JSON.parse(jwtToken) } }).then(res => {
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
          <Suspense fallback={<Loading/>}>
            <Header/>
            <Routes>
                <Route path="*" element={<NotFound/>}/>
                <Route exact path="/" element={<Home/>}/>
                <Route path="/explore" element={<Explore/>}/>
                {/* <Route path="/helpcenter" element={<Helpcenter/>}/> */}
                {/* <Route path="/ranking" element={<Rangking/>}/> */}
                <Route path="/item-detail/:id" element={<ItemDetail/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/register" element={<Register/>}/>
                {/* <Route path="/create" element={<Create/>}/> */}
                <Route path="/activity" element={<Activity/>}/>
                {/* <Route path="/contact" element={<Contact/>}/> */}
                <Route path="/folder-explorer/:id" element={<FolderItems/>}/>
                <Route path={Object.keys(userData).length > 2 ? "/profile" : "/404"} element={Object.keys(userData).length > 2 ? <Profile/>: <NotFound/>}/>
                <Route path="/user/:username" element={<Collection/>}/>
            </Routes>
          </Suspense>
        </Router>
      <ScrollToTopBtn />
      
    </div>
  )
};
export default app;