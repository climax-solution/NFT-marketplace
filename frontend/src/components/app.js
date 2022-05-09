import React, { Suspense, useEffect, lazy } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from "react-redux";
import ScrollToTopBtn from './menu/ScrollToTop';
import { UPDATE_AUTH, UPDATE_LOADING_PROCESS } from '../store/action/auth.action';
import Loading from './components/Loading/Loading';
import 'react-toastify/dist/ReactToastify.css';

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
const Users = lazy(() => import('./pages/Users'));
const BidView = lazy(() => import('./components/Profile/Bid/BidView'));
const SellingNFT = lazy(() => import('./components/Profile/SellingNFT/SellingNFT'));
const CollectedNFT = lazy(() => import('./components/Profile/Collected/CollectedNFT'));
const ManageInfo = lazy(() => import('./components/Profile/manageInfo'));
const Bid = lazy(() => import('./components/Profile/Bid/Bid'));
const Mint = lazy(() => import('./components/Profile/Mint/Mint'));
const ManageFolder = lazy(() => import('./components/Profile/Folders'));
const FolderList = lazy(() => import('./components/Profile/Folders/Folderlist'));
const VerifyAccount = lazy(() => import('./pages/verify'));
const Whitelist = lazy(() => import('./components/Profile/Folders/Whitelist'));
const Footer = lazy(() => import('./components/footer'));

const app = () => {
  const dispatch = useDispatch();

  const loadingProcessing = useSelector((state) => state.auth.isLoading);
  const userData = useSelector((state) => state.auth.user);

  useEffect(async() => {
    const jwtToken = localStorage.getItem("nftdevelopments-token");
    dispatch(UPDATE_LOADING_PROCESS(true));
    if (jwtToken) {
      await axios.post(`${process.env.REACT_APP_BACKEND}auth/check-authentication`, {}, { headers :{ Authorization: JSON.parse(jwtToken) } }).then(res => {
        const { data } = res;
        dispatch(UPDATE_AUTH(data ? data : {walletAddress: ''}));
        dispatch(UPDATE_LOADING_PROCESS(false));
      }).catch((err) => {
        dispatch(UPDATE_AUTH({
          walletAddress: ''
        }));
        dispatch(UPDATE_LOADING_PROCESS(false));

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
      <ToastContainer/>
        <Router>
          <Suspense fallback={<Loading/>}>
            <Header/>
            <Routes>
                <Route exact path="/" element={<Home/>}/>
                <Route path="/explore" element={<Explore/>}/>
                <Route path="/item-detail/:id" element={<ItemDetail/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/verify/:token/:email/:username" element={<VerifyAccount/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/activity" element={<Activity/>}/>
                <Route path="/users" element={<Users/>}/>
                <Route path="/folder-explorer/:id" element={<FolderItems/>}/>
                <Route path='profile' element={Object.keys(userData).length > 2 ? <Profile/> : <Navigate replace to="/404"/>}>
                  <Route index element={<SellingNFT/>}/>
                  <Route path="collected" element={<CollectedNFT/>}/>
                  <Route path="userinfo" element={<ManageInfo/>}/>
                  <Route path="bids" element={<Bid/>}/>
                  <Route path="mint" element={<Mint/>}/>
                  <Route path="folders" element={<ManageFolder/>}>
                    <Route index element={<FolderList/>}/>
                    <Route path="manage-whitelist/:folderID" element={<Whitelist/>}/>
                  </Route>
                </Route>
                <Route path="/user/:username" element={<Collection/>}/>
                <Route path="/explore-bids/:tokenID" element={<BidView/>}/>
                <Route path='*' element={<NotFound/>}/>
            </Routes>
            <Footer/>
          </Suspense>
        </Router>
      <ScrollToTopBtn />
      
    </div>
  )
};
export default app;