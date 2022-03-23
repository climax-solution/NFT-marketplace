import React, { useState,lazy } from 'react';
import axios from 'axios';
import { phone } from "phone";
import { createGlobalStyle } from 'styled-components';
import { toast } from 'react-toastify';
import validator from "validator";
import { useNavigate } from 'react-router-dom';

const TextInput = lazy(() => import('../components/Form/TextInput'));
const PhoneInput = lazy(() => import('../components/Form/PhoneInput'));
const PasswordInput = lazy(() => import('../components/Form/PasswordInput'));
const DateInput = lazy(() => import('../components/Form/DateInput'));
const CountryList  = lazy(() => import( '../components/Form/CountryDropdown'));
const Footer = lazy(() => import('../components/footer'));

const GlobalStyles = createGlobalStyle`
    .country-select {
        display: block !important;
    }
    .react-tel-input {
        .form-control {
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            border-color: rgba(255,2555,255, 0.1) !important;
        }

        .form-control:focus {
            color: #212529;
            background-color: #fff !important;
            border-color: #86b7fe;
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgb(13 110 253 / 25%);
        }

        .flag-dropdown {
            background: transparent !important;
            border: none !important;
            border-right: 1px solid rgba(255,255,255,0.1) !important;
        }
        .form-control:focus + .flag-dropdown {
            border-color: #cacaca;
        }
    }
`;

const Register = () => {

    const navigate = useNavigate();
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email ,setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [birthday, setBirthDate] = useState('');
    const [country, setCountry] = useState('United States');
    const [phoneNumber ,setPhoneNumber] = useState('');
    const [walletAddress, setWalletAddres] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [update, setUpdate] = useState(false);

    const register = async() => {

        try {
            let flag = 0;

            if (!firstName) flag = 1;

            if (!lastName) flag = 1;

            if (!email || !validator.isEmail(email)) flag = 1;

            if (!username) flag = 1;

            if (!birthday) flag = 1;

            if (!country) flag = 1;

            if (!phoneNumber) flag = 1;

            else {
                const res = phone(phoneNumber);
                if (!res.isValid) flag = 1;
            }

            if (!walletAddress) flag = 1;
            else if (!validator.isEthereumAddress(walletAddress)) flag = 1;

            if (!password || !confirmPassword || password && confirmPassword && password !== confirmPassword) flag = 1;

            if (flag) {
                setUpdate(true);
                return;
            }
            // setUpdate(false);
            const data = {
                username,
                email,
                firstName,
                lastName,
                birthday,
                phoneNumber,
                country,
                walletAddress,
                password
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}auth/register`, data).then(res => {
                const { message } = res.data;
                toast.success(message, {
                    theme: "colored",
                    position: "top-center",
                    autoClose: 2000
                }, () => {navigate("/");});
                
            }).catch(err => {
                const { error } = err.response.data;
                toast.error(error, {
                    theme: "colored",
                    position: "top-center",
                });
            })
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div>
            <>
                <GlobalStyles />
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
                                        label={"First Name"}
                                        update={setFirstName}
                                        _key={"firstname"}
                                        _request={update}
                                    />
                                </div>
                                
                                <div className="col-md-6">
                                    <TextInput
                                        label={"Last Name"}
                                        update={setLastName}
                                        _key={"lastname"}
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
                                    <DateInput
                                        label={"Birth date"}
                                        update={setBirthDate}
                                        _request={update}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <CountryList
                                        update={setCountry}
                                        _request={update}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <PhoneInput
                                        label={"Phone"}
                                        update={setPhoneNumber}
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

                <Footer />
            </>
        </div>

    );
}
export default Register;