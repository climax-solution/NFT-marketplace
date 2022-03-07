import React, { useState,lazy, Suspense } from 'react';
import axios from 'axios';
import { phone } from "phone";
import { createGlobalStyle } from 'styled-components';
import { toast } from 'react-toastify';
import validator from "validator";
import { UPDATE_AUTH } from '../../store/action/auth.action';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CountryList from '../components/Form/CountryDropdown';
import Loading from '../components/Loading/Loading';

const TextInput = lazy(() => import('../components/Form/TextInput'));
const PhoneInput = lazy(() => import('../components/Form/PhoneInput'));
const PasswordInput = lazy(() => import('../components/Form/PasswordInput'));
const DateInput = lazy(() => import('../components/Form/DateInput'));
const Footer = lazy(() => import('../components/footer'));

const GlobalStyles = createGlobalStyle`
    .country-select {
        display: block !important;
    }
    .f-12px {
        font-size: 12px;
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

            await axios.post("http://nftdevelopments.co.nz/auth/register", data).then(res => {
                const { user } = res.data;
                toast.success("you have registered successfully!", { theme: "colored" });
                dispatch(UPDATE_AUTH(user));
                navigate("/profile");
            }).catch(err => {
                const { error } = err.response.data;
                toast.error(error, { theme: "colored" });
            })
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div>
            <Suspense fallback={<Loading/>}>
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
            </Suspense>
        </div>

    );
}
export default Register;