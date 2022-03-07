import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createGlobalStyle } from 'styled-components';
import { useNavigate, useParams } from "react-router-dom";

import Footer from '../components/footer';
import PasswordInput from '../components/Form/PasswordInput';

const GlobalStyles = createGlobalStyle`
  .box-login{
    border-radius: 3px;
    padding: 40px 50px;
  }
  .f-12px {
    font-size: 12px;
  }
`;

const ResetPassword = () => {

    const navigate = useNavigate();
    const { token } = useParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [update, setUpdate] = useState(false);
    const [success, setSuccess] = useState(false);

    const authenticate = async() => {
        let flag = 0;
        if (!password || !confirmPassword || password && confirmPassword && password !== confirmPassword) flag = 1;
        console.log(!password , !confirmPassword , password , confirmPassword , password === confirmPassword)
        if (flag) {
            setUpdate(true);
            return;
        }

        setUpdate(false);

        await axios.post('http://nftdevelopments.co.nz/auth/reset/' + token, { password }).then(res => {
            const { message } = res.data;
            toast.success(message, { theme: "colored" });
            setPassword('');
            setConfirmPassword('');
            setSuccess(true);
        }).catch(err => {
            const { error } = err.response.data;
            toast.error(error, { theme: "colored" });
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
                  <h3 className="mb10">Reset new password</h3>
                  <div name="contactForm" id='contact_form' className="form-border" action='#'>

                    <PasswordInput
                        label={"Password"}
                        update={setPassword}
                        _request={update}
                        _equal = {password && confirmPassword ? password === confirmPassword : true}
                    />

                    <PasswordInput
                        label={"Re-enter Password"}
                        update={setConfirmPassword}
                        _request={update}
                        _equal = {password && confirmPassword ? password === confirmPassword : true}
                    />

                    <div className="field-set mt-3">
                      <input
                        type='submit'
                        id='send_message'
                        value={ !success ? 'Send' : 'Return to login'}
                        className="btn btn-main btn-fullwidth color-2"
                        onClick={() => !success ? authenticate : navigate('/login') }
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
export default ResetPassword;