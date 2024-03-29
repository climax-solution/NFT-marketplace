import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { success_toastify, error_toastify } from "../../../utils/notify";

import PasswordInput from '../../components/Form/PasswordInput';

const ResetPassword = () => {

    const navigate = useNavigate();
    const { token } = useParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [update, setUpdate] = useState(false);
    const [success, setSuccess] = useState(false);

    const authenticate = async() => {
        let flag = 0;
        if (!password || !confirmPassword || (password && confirmPassword && password !== confirmPassword)) flag = 1;
        console.log(!password , !confirmPassword , password , confirmPassword , password === confirmPassword)
        if (flag) {
            setUpdate(true);
            return;
        }

        setUpdate(false);

        await axios.post(`${process.env.REACT_APP_BACKEND}auth/reset/${token}`, { password }).then(res => {
            const { message } = res.data;
            success_toastify(message);
            setPassword('');
            setConfirmPassword('');
            setSuccess(true);
        }).catch(err => {
            const { error } = err.response.data;
            error_toastify(error);
        })
    }

  return(
    <div>

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
                        value={ !success ? 'Submit' : 'Return to login'}
                        className="btn btn-main btn-fullwidth color-2"
                        onClick={() => !success ? authenticate() : navigate('/login') }
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
    </div>
  )
};
export default ResetPassword;