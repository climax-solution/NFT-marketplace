import React, { useState } from 'react';
import axios from 'axios';
import validator from "validator";
import { useNavigate } from 'react-router-dom';
import { success_toastify, error_toastify } from "../../../utils/notify";

import TextInput from '../../components/Form/TextInput';
import PasswordInput from '../../components/Form/PasswordInput';

const Register = () => {

    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email ,setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [walletAddress, setWalletAddres] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [update, setUpdate] = useState(false);

    const register = async() => {

        try {
            let flag = 0;

            if (!name) flag = 1;

            if (!email || !validator.isEmail(email)) flag = 1;

            if (!username) flag = 1;

            if (!walletAddress) flag = 1;

            else if (!validator.isEthereumAddress(walletAddress)) flag = 1;

            if (!password || !confirmPassword || (password && confirmPassword && password !== confirmPassword)) flag = 1;

            if (flag) {
                setUpdate(true);
                return;
            }
            // setUpdate(false);
            const data = {
                username,
                email,
                name,
                walletAddress,
                password
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}auth/register`, data).then(res => {
                const { message } = res.data;
                success_toastify(message);
                navigate("/");
                
            }).catch(err => {
                const { error } = err.response.data;
                error_toastify(error);
            })
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div>
            <section className='container'>
                <div className="row">
                <div className='spacer-double'></div>
                <div className="col-md-8 offset-md-2">
                <h3>Don't have an account? Register now.</h3>
                <p>Registering provides another layer of protection for your NFTs. So register now! And let’s start collecting.</p>

                <div className="spacer-10"></div>

                <div name="contactForm" id='contact_form' className="form-border" action='#'>

                        <div className="row">
                            <div className="col-md-6">
                                <TextInput
                                    label={"Name"}
                                    update={setName}
                                    _key={"name"}
                                    _request={update}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextInput
                                    label={"Email"}
                                    update={setEmail}
                                    _key={"email"}
                                    checkable={true}
                                    _request={update}
                                />
                            </div>

                            <div className="col-md-6">
                                <TextInput
                                    label={"Choose a Username"}
                                    update={setUserName}
                                    _key={"username"}
                                    checkable={true}
                                    _request={update}
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <TextInput
                                    label={"Wallet Address"}
                                    update={setWalletAddres}
                                    _key={"walletAddress"}
                                    checkable={true}
                                    _request={update}
                                />
                            </div>

                            <div className="col-md-6">
                                <PasswordInput
                                    label={"Password"}
                                    update={setPassword}
                                    _request={update}
                                    _equal = {password && confirmPassword ? password === confirmPassword : true}
                                />
                            </div>

                            <div className="col-md-6">
                                <PasswordInput
                                    label={"Re-enter Password"}
                                    update={setConfirmPassword}
                                    _request={update}
                                    _equal = {password && confirmPassword ? password === confirmPassword : true}
                                />
                            </div>

                            <div className="col-md-12">
                                <div id='submit' className="pull-left mt-4">
                                    <input type='submit' id='send_message' value='Register Now' className="btn btn-main color-2" onClick={register}/>
                                </div>
                                
                                <div className="clearfix"></div>
                            </div>

                        </div>
                    </div>
                </div>

                </div>
            </section>
        </div>

    );
}
export default Register;