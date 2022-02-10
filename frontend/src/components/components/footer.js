import React from 'react';
import { Link } from 'react-router-dom';

const socials =  [
    {id: 1, link: 'https://twitter.com/NFTDevelopments', icon: 'fab fa-twitter'},
    {id: 2, link: 'https://instagram.com/NFTDevelopments', icon: 'fab fa-instagram'},
    {id: 3, link: 'https://tiktok.com/@NFTDevelopments', icon: 'fab fa-tiktok'},
    {id: 4, link: 'https://www.youtube.com/channel/UCbPW7kuPqflfqplBZy8knsg', icon: 'fab fa-youtube'},
    {id: 5, link: 'https://www.linkedin.com/in/nft-developments-372a08222/', icon: 'fab fa-linkedin'},
    {id: 6, link: 'mailto:Enquire@NFTDevelopments.com', icon: 'fa fa-envelope'},
    {id: 7, link: 'https://t.me/NFTdevelopments', icon: 'fab fa-telegram'},
];

const footer= () => (
  <footer className="footer-light">
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
                                <li><Link to="">Discord</Link></li>
                                <li><Link to="">Docs</Link></li>
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
                                <li><Link to="">Brand Assets</Link></li>
                                <li><Link to="">Blog</Link></li>
                                <li><Link to="">Forum</Link></li>
                                <li><Link to="">Mailing List</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-1">
                        <div className="widget">
                            <h5>Newsletter</h5>
                            <p>Signup for our newsletter to get the latest news in your inbox.</p>
                            <form action="#" className="row form-dark" id="form_subscribe" method="post" name="form_subscribe">
                                <div className="col text-center">
                                    <input className="form-control" id="txt_subscribe" name="txt_subscribe" placeholder="enter your email" type="text" /> 
                                    <Link to="" id="btn-subscribe">
                                      <i className="arrow_right bg-color-secondary"></i>
                                    </Link>
                                    <div className="clearfix"></div>
                                </div>
                            </form>
                            <div className="spacer-10"></div>
                            <small>Your email is safe with us. We don't spam.</small>
                        </div>
                    </div>
                </div>
            </div>
            <div className="subfooter">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="de-flex">
                                <div className="de-flex-col">
                                    <span onClick={()=> window.open("", "_self")}>
                                        <span className="copy">&copy; Copyright 2022 - NFT Developments Marketplace </span>
                                    </span>
                                </div>
                                <div className="de-flex-col">
                                    <div className="social-icons">
                                        {
                                            socials.map((item, index) => {
                                                return (
                                                    <span onClick={()=> window.open(`${item.link}`, "_blank")} key={index}><i className={item.icon}></i></span>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
);
export default footer;