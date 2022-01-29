import React from 'react';
import { createGlobalStyle } from 'styled-components';
import CountryDropdown from 'country-dropdown-with-flags-for-react';
import PhoneInput from 'react-phone-input-2'
import Footer from '../components/footer';
import 'react-phone-input-2/lib/style.css';

const GlobalStyles = createGlobalStyle`
    header#myHeader.navbar.white {
        background: #212428;
    }
    .country-select {
        display: block;
    }
    .react-tel-input {
        .form-control {
            width: 100% !important;
            height: auto !important;
            background: transparent;
            border-color: rgba(255,2555,255, 0.1);
        }

        .form-control:focus {
            color: #212529;
            background-color: #fff;
            border-color: #86b7fe;
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgb(13 110 253 / 25%);
        }

        .flag-dropdown {
            background: transparent;
            border: none;
            border-right: 1px solid rgba(255,255,255,0.1);
        }
        .form-control:focus + .flag-dropdown {
            border-color: #cacaca;
        }
    }
`;


const register= () => {
        
    return (
        <div>
            <GlobalStyles />


            <section className='container'>
                <div className="row">
                <div className='spacer-double'></div>
                <div className="col-md-8 offset-md-2">
                <h3>Don't have an account? Register now.</h3>
                                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

                <div className="spacer-10"></div>

                <form name="contactForm" id='contact_form' className="form-border" action='#'>

                        <div className="row">

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>First Name:</label>
                                    <input type='text' name='first-name' id='first-name' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Last Name:</label>
                                    <input type='text' name='last-name' id='last-name' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Email Address:</label>
                                    <input type='text' name='email' id='email' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Choose a Username:</label>
                                    <input type='text' name='username' id='username' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Birth date:</label>
                                    <input type='date' name='birth-date' id='birth-date' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Country:</label>
                                    <CountryDropdown  id="country-list" className="form-control" preferredCountries={['nz', 'us']}  value={""} handleChange={e => console.log(e.target.value)}/>
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
                                            autoFocus: true
                                        }}
                                        className="w-100"
                                        enableSearch={true}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Wallet Address:</label>
                                    <input type='text' name='wallet-address' id='wallet-address' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Password:</label>
                                    <input type='text' name='password' id='password' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="field-set">
                                    <label>Re-enter Password:</label>
                                    <input type='text' name='re-password' id='re-password' className="form-control"/>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div id='submit' className="pull-left">
                                    <input type='submit' id='send_message' value='Register Now' className="btn btn-main color-2" />
                                </div>
                                
                                <div className="clearfix"></div>
                            </div>

                        </div>
                    </form>
                </div>

                </div>
            </section>

            <Footer />
        </div>

    );
}
export default register;