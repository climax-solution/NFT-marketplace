import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import validator from "validator";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UPDATE_AUTH } from "../../../store/action/auth.action";
import { WalletConnect } from "../../../store/action/wallet.action";
import { error_toastify, success_toastify } from "../../../utils/notify";

export default function ManageInfo() {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initUserData = useSelector((state) => state.auth.user);
    const [userData, setUserData] = useState({});
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (initUserData) setUserData(initUserData);
    },[initUserData])

    const updateUserInfo = async() => {
        let updatedData = { ...userData };
        const { name, email, password, confirmPassword } = updatedData;
        if (!name || !validator.isEmail(email)) {
          error_toastify("You must input name, email correctly!");
          return;
        }
    
        if (password && confirmPassword && password !== confirmPassword) {
          error_toastify("Please confirm your password!");
          return;
        } else {
          delete updatedData['password'];
          delete updatedData['confirmPassword'];
        }
        
        const jwtToken = localStorage.getItem("nftdevelopments-token");
        const _headers = { headers :{ Authorization: JSON.parse(jwtToken) } };

        setLoading(true);
        await axios.post(`${process.env.REACT_APP_BACKEND}user/update-user`, updatedData, _headers).then(res => {
          const { message, status } = res.data;
          success_toastify(message);
          if (!status) {
            dispatch(UPDATE_AUTH(res.data.user));
          }
          else {
            setTimeout(3000, () => logout());
          }
        }).catch(err => {
          const { error } = err.response.data;
          error_toastify(error);
          logout();
        })

        setUserData({ ...userData, password: '', confirmPassword: '' });
        
        setLoading(false);
      }

    const logout = () => {
      localStorage.removeItem("nftdevelopments-token");
      localStorage.setItem("nftdevelopments-connected", JSON.stringify({ connected: false }));
      dispatch(UPDATE_AUTH({ walletAddress: '' }));
      dispatch(WalletConnect());
      navigate('/');
    }

    return(
        <div id='zero3' className='onStep fadeIn mn-h-300px'>
            {
                Object.keys(userData).length && (
                    <div id='zero4' className='onStep fadeIn'>
                      <div id="form-create-item" className="form-border row justify-content-center" action="#">
                        
                        <div className="field-set col-md-8 mg-auto p-4 position-relative user-info">
                            {
                                isLoading && (
                                  <div className='d-flex w-100 h-100 flex-column justify-content-center align-items-center start-0 top-0 position-absolute bg-dark-transparent' >
                                    <div className='reverse-spinner'></div>
                                  </div>
                                )
                            }
                            <div className="spacer-single"></div>
                            <div className="row">
                              <div className="col-md-6 col-12">
                                <span>Name</span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Please enter your name"
                                  value={userData.name}
                                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
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
                                <span>Telegram</span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Please enter your tiktok profile link"
                                  value={userData.telegram}
                                  onChange={(e) => setUserData({ ...userData, telegram: e.target.value })}
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
                              <div className="col-12">
                                <span>Description</span>
                                <textarea
                                  className="form-control"
                                  placeholder="Please enter bio about you"
                                  value={userData.description}
                                  onChange={(e) => setUserData({ ...userData, description: e.target.value })}
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
            }
        </div>
    )
}