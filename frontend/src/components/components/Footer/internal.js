import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import validator from "validator";
import { warning_toastify, success_toastify, error_toastify } from "../../../utils/notify";

export default function InternalLinks() {

    const [email, setEmail] = useState('');

    const sendEmail = async() => {
        if (!validator.isEmail(email)) {
            warning_toastify("Email is invalid");
            return;
        }

        await axios.post(`${process.env.REACT_APP_BACKEND}news/request`, { email }).then(res => {
            const { message } = res.data;
            success_toastify(message);
        }).catch(err => {
            const { error } = err.response.data;
            error_toastify(error);
        })
        setEmail('');
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-3 col-sm-6 col-xs-1">
                    <div className="widget">
                        <h5>Marketplace</h5>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/explore">Explorer</Link></li>
                            <li><Link to="/activity">Activity</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 col-xs-1">
                    <div className="widget">
                        <h5>Resources</h5>
                        <ul>
                            <li><Link to="">Help Center</Link></li>
                            <li><Link to="">Partners</Link></li>
                            <li><Link to="">Suggestions</Link></li>
                            <li><a href="https://discord.gg/ZucajFMre8" target="_blank">Discord</a></li>
                            <li><Link to="">Newsletter</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 col-xs-1">
                    <div className="widget">
                        <h5>Community</h5>
                        <ul>
                            <li><Link to="">Community</Link></li>
                            <li><Link to="">Documentation</Link></li>
                            <li><Link to="">Blog</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 col-xs-1">
                    <div className="widget">
                        <h5>Newsletter</h5>
                        <p>Signup for our newsletter to get the latest news in your inbox.</p>
                        <form action="#" className="row form-dark" id="form_subscribe" method="post" name="form_subscribe">
                            <div className="col text-center">
                                <input
                                    className="form-control"
                                    id="txt_subscribe"
                                    name="txt_subscribe"
                                    placeholder="enter your email"
                                    type="text"
                                    value={email}
                                    onChange={({ target }) => setEmail(target.value)}
                                />
                                <span onClick={sendEmail} id="btn-subscribe" role="button">
                                    <i className="far fa-arrow-right bg-color-secondary"></i>
                                </span>
                                <div className="clearfix"></div>
                            </div>
                        </form>
                        <div className="spacer-10"></div>
                        <small>Your email is safe with us. We don't spam.</small>
                    </div>
                </div>
            </div>
        </div>
    )
}