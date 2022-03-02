import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Footer from '../components/footer';
import { UPDATE_AUTH } from '../../store/action/auth.action';

const GlobalStyles = createGlobalStyle`
  .box-login p{
    color: #a2a2a2 !important;
  }
  .box-login{
    border-radius: 3px;
    padding: 40px 50px;
  }
`;

const login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

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
      setPasswordStatus("Pleaes enter correctly");
      flag = 1;
    }
    else setPasswordStatus("");
    if (flag) return;
    const data = {
      id: email,
      password
    };
    await axios.post("http://nftdevelopments.co.nz/auth/login", data).then(res => {
      toast.success("You have logined successfully", {theme: "colored"});
      const { token } = res.data;
      localStorage.setItem("nftdevelopments-token", JSON.stringify(token));
      dispatch(UPDATE_AUTH(token));
      navigate('/profile');
    }).catch(err => {
      const { error } = err.response.data;
      toast.error(error, {theme: "colored"});
    })
  }

  return(
    <div>
    <GlobalStyles/>

      <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'./img/background/bg.webp'})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row align-items-center px-0'>
              <div className="col-lg-4 offset-lg-4 m-auto px-0">
                <div className="box-login">
                  <h3 className="mb10">Sign In</h3>
                  <p>Login using an existing account or create a new account <span>here</span>.</p>
                  <div name="contactForm" id='contact_form' className="form-border" action='#'>

                    <div className="field-set">
                      <input
                        type='text'
                        name='email'
                        id='email'
                        className="form-control"
                        placeholder="Please enter your email or username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label className='text-danger'>{emailStatus}</label>
                    </div>
                    
                    <div className="field-set">
                      <input
                        type='password'
                        name='password'
                        id='password'
                        className="form-control"
                        placeholder="Please enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <label className='text-danger'>{passwordStatus}</label>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
};
export default login;