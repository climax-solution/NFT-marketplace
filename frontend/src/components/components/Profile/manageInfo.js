import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EmailValidator from 'email-validator';
import { NotificationManager } from "react-notifications";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UPDATE_AUTH } from "../../../store/action/auth.action";
import { WalletConnect } from "../../../store/action/wallet.action";
import Loading from "../Loading/Loading";

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
        const { firstName, lastName, email, password, confirmPassword } = userData;
        if (!firstName || !lastName || !EmailValidator.validate(email)) {
          NotificationManager.warning("You must input first name, last name, email correctly!");
          return;
        }
    
        if (!password || password && password !== confirmPassword) {
          NotificationManager.warning("Please confirm your password!");
          return;
        }
        
        const jwtToken = localStorage.getItem("nftdevelopments-token");
        const _headers = { headers :{ Authorization: JSON.parse(jwtToken) } };

        setLoading(true);
        await axios.post("http://nftdevelopments.co.nz/user/update-user", userData, _headers).then(res => {
          const { data } = res;
          dispatch(UPDATE_AUTH(data));
          NotificationManager.success("Updated profile successfully!");
        }).catch(err => {
          const { error } = err.response.data;
          NotificationManager.error(error);
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
        <>
          { isLoading && <Loading/> }
            {
                Object.keys(userData).length && (
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
            }
        </>
    )
}