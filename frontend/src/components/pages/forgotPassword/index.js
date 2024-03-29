import React, { useState } from 'react';
import axios from 'axios';
import { createGlobalStyle } from "styled-components";
import { success_toastify, error_toastify } from "../../../utils/notify";
import style from "./style.js";

const GlobalStyle = createGlobalStyle`${style}`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  const authenticate = async() => {
    let flag = 0;
    if (!email) {
      setEmailStatus("Please enter correctly");
      flag = 1;
    }
    else setEmailStatus("");

    if (flag) return;
    const data = { email };

    await axios.post(`${process.env.REACT_APP_BACKEND}auth/forgot`, data).then(res => {
      const { message } = res.data;
      success_toastify(message);
    }).catch(err => {
      const { error } = err.response.data;
      error_toastify(error);
    })
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
                  <h3 className="mb10">Reset your password</h3>
                  <p>Please enter marketplace email address so we can reset your password.</p>
                  <div name="contactForm" id='contact_form' className="form-border" action='#'>

                    <div className="field-set">
                      <input
                        type='text'
                        name='email'
                        id='email'
                        className="form-control mb-0"
                        placeholder="Please enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label className='text-danger f-12px'>{emailStatus}</label>
                    </div>
                    
                    <div className="field-set">
                      <input
                        type='submit'
                        id='send_message'
                        value='Send'
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
    </>
  )
};
export default ForgotPassword;