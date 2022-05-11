import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { UPDATE_AUTH } from '../../../store/action/auth.action';
import { success_toastify, error_toastify } from "../../../utils/notify";
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [isLoading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authenticate = async() => {
    let flag = 0;
    if (!email) {
      setEmailStatus("Please enter correctly");
      flag = 1;
    }
    else setEmailStatus("");

    if (!password) {
      setPasswordStatus("Please enter correctly");
      flag = 1;
    }
    else setPasswordStatus("");
    if (flag) return;
    const data = {
      id: email,
      password
    };
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}auth/login`, data).then(res => {
        success_toastify("You have logged in successfully");
        const { token, user } = res.data;
        localStorage.setItem("nftdevelopments-token", JSON.stringify(token));
        dispatch(UPDATE_AUTH(user));
        navigate('/profile');
      }).catch(err => {
        const { error } = err.response.data;
        error_toastify(error);
      })
    } catch(err) {
      
    }
    setLoading(false);
  }

  return(
    <>
      <GlobalStyle/>
      <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'./img/background/bg.webp'})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row align-items-center px-0'>
              <div className="col-lg-4 offset-lg-4 m-auto px-0">
                <div className="box-login">
                  <h3 className="mb10">Sign In</h3>
                  <p>Login using an existing account or create a new account <span onClick={() => navigate('/register')}>here</span>.</p>
                  <div name="contactForm" id='contact_form' className="form-border" action='#'>

                    <div className="field-set">
                      <input
                        type='text'
                        name='email'
                        id='email'
                        className="form-control mb-0"
                        placeholder="Please enter your email or username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label className='text-danger f-12px'>{emailStatus}</label>
                    </div>
                    
                    <div className="field-set">
                      <input
                        type='password'
                        name='password'
                        id='password'
                        className="form-control mb-0"
                        placeholder="Please enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <label className='text-danger f-12px'>{passwordStatus}</label>
                    </div>
                    <div className='mb-2'>
                      <Link to="/forgot-password" className='text-decoration-none'>Forgot Password?</Link>
                    </div>
                    <div className="field-set">
                      <input
                        type='submit'
                        id='send_message'
                        value='Login'
                        className="btn btn-main btn-fullwidth color-2"
                        onClick={authenticate}
                      />
                    </div>
                    <div className="spacer-half"></div>
                  </div>
                  {
                    isLoading ? (
                      <div className='d-flex w-100 h-100 justify-content-center align-items-center'>
                          <div className='reverse-spinner'></div>
                      </div>
                    ) : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
};
export default Login;