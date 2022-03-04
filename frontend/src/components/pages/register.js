import React, { useState,lazy, Suspense } from 'react';
import axios from 'axios';
import { phone } from "phone";
import { createGlobalStyle } from 'styled-components';
import { toast } from 'react-toastify';
import CountryDropdown from 'country-dropdown-with-flags-for-react';
import PhoneInput from 'react-phone-input-2'
import walletValidator from 'wallet-address-validator';
import EmailValidator from 'email-validator';
import 'react-phone-input-2/lib/style.css';
import { UPDATE_AUTH } from '../../store/action/auth.action';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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

const Register= () => {

    const dispatch = useDispatch();
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
    
    const [firstNameStatus, setFirstNameStatus] = useState('');
    const [lastNameStatus, setLastNameStatus] = useState('');
    const [emailStatus ,setEmailStatus] = useState('');
    const [usernameStatus, setUserNameStatus] = useState('');
    const [birthdayStatus, setBirthDateStatus] = useState('');
    const [countryStatus, setCountryStatus] = useState('');
    const [phoneNumberStatus ,setPhoneNumberStatus] = useState('');
    const [walletAddressStatus, setWalletAddresStatus] = useState('');
    const [passwordStatus, setPasswordStatus] = useState('');
    const [confirmPasswordStatus, setConfirmPasswordStatus] = useState('');

    const register = async() => {
        let flag = 0;
        if (!firstName) {
            setFirstNameStatus("Please enter your first name.");
            flag = 1;
        } else setFirstNameStatus("");

        if (!lastName) {
            setLastNameStatus("Please enter your last name.");
            flag = 1;
        } else setLastNameStatus("");

        if (!email || !EmailValidator.validate(email)) {
            setEmailStatus("Please enter your correct email.");
            flag = 1;
        } else setEmailStatus("");

        if (!username) {
            setUserNameStatus("Please enter your user name");
            flag = 1;
        } else setUserNameStatus("");

        if (!birthday) {
            setBirthDateStatus("Please enter your birthday");
            flag = 1;
        } else setBirthDateStatus("");

        if (!country) {
            setCountryStatus("Please enter your country");
            flag = 1;
        } else setCountryStatus("");

        if (!phoneNumber) {
            setPhoneNumberStatus("Please enter your phone number");
            flag = 1;
        } else {
            const res = phone(phoneNumber);
            if (!res.isValid) {
                setPhoneNumberStatus("Please enther your correct phone number.");
                flag = 1;
            }
            else setPhoneNumberStatus("");
        }

        if (!walletAddress) {
            setWalletAddresStatus("Please enter your wallet address");
            flag = 1;
        } else {
            if (!walletValidator.validate(walletAddress, "ETH")) {
                setWalletAddresStatus("Please enter your correct wallet address");
                flag = 1;
            } else setWalletAddresStatus("");
        }

        if (!password) {
            setPasswordStatus("Please enter your password");
            flag = 1;
        } else setPasswordStatus("");

        if (!confirmPassword || password && confirmPassword && password !== confirmPassword) {
            setConfirmPasswordStatus("Please confirm your password");
            flag = 1;
        } else setConfirmPasswordStatus("");

        if (flag) return;

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

        await axios.post("http://nftdevelopments.co.nz/auth/register", data).then(res => {

            const { user } = res.data;
            toast.success("You have registered successfully!", { theme: "colored" });
            dispatch(UPDATE_AUTH(user));
            navigate("/profile");
        }).catch(err => {
            const { error } = err.response.data;
            toast.error(error, { theme: "colored" });
        })
    }

    const handleChangePhone = (value) => {
        setPhoneNumber("+"+value);
    }

    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <GlobalStyles />
                <section className='container'>
                    <div className="row">
                    <div className='spacer-double'></div>
                    <div className="col-md-8 offset-md-2">
                    <h3>Don't have an account? Register now.</h3>
                                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

                    <div className="spacer-10"></div>

                    <div name="contactForm" id='contact_form' className="form-border" action='#'>

                            <div className="row">

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>First Name:</label>
                                        <input type='text' name='first-name' id='first-name' className="form-control mb-0" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                                        {
                                            <label className='text-danger'>{firstNameStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Last Name:</label>
                                        <input type='text' name='last-name' id='last-name' className="form-control mb-0" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                                        {
                                            <label className='text-danger'>{lastNameStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Email Address:</label>
                                        <input type='email' name='email' id='email' className="form-control mb-0" value={email} onChange={(e) => setEmail(e.target.value) }/>
                                        {
                                            <label className='text-danger'>{emailStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Choose a Username:</label>
                                        <input type='text' name='username' id='username' className="form-control mb-0" value={username} onChange={(e) => setUserName(e.target.value)}/>
                                        {
                                            <label className='text-danger'>{usernameStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Birth date:</label>
                                        <input type='date' name='birth-date' id='birth-date' className="form-control mb-0" value={birthday} onChange={(e) => setBirthDate(e.target.value) }/>
                                        {
                                            <label className='text-danger'>{birthdayStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Country:</label>
                                        <CountryDropdown
                                            id="country-list"
                                            className="form-control mb-0"
                                            preferredCountries={['us']}
                                            value={country}
                                            handleChange={e => setCountry(e.target.value)}

                                            isValid={(inputNumber, country, countries) => {
                                                return countries.some((country) => {
                                                return inputNumber;
                                                });
                                            }}
                                            
                                        />
                                        {
                                            <label className='text-danger'>{countryStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Phone:</label>
                                        <PhoneInput
                                            country={'us'}
                                            inputProps={{
                                                name: 'phone',
                                                required: true,
                                            }}
                                            className="w-100"
                                            enableSearch={true}
                                            value={phoneNumber}
                                            onChange={handleChangePhone}
                                        />
                                        {
                                            <label className='text-danger'>{phoneNumberStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Wallet Address:</label>
                                        <input type='text' name='wallet-address' id='wallet-address' className="form-control mb-0" value={walletAddress} onChange={(e) => setWalletAddres(e.target.value) }/>
                                        {
                                            <label className='text-danger'>{walletAddressStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Password:</label>
                                        <input type='password' name='password' id='password' className="form-control mb-0" value={password} onChange={(e) => setPassword(e.target.value) }/>
                                        {
                                            <label className='text-danger'>{passwordStatus}</label>
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="field-set">
                                        <label>Re-enter Password:</label>
                                        <input type='password' name='re-password' id='re-password' className="form-control mb-0" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                                                                            {
                                            <label className='text-danger'>{confirmPasswordStatus}</label>
                                        }
                                    </div>
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
            </Suspense>
        </div>

    );
}
export default Register;