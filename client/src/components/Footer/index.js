import React, { Component } from 'react';
class Footer extends Component {
    state = {
        data: {},
        socialData: [
            {id: 1, link: 'https://twitter.com/NFTDevelopments', icon: 'fab fa-twitter'},
            {id: 2, link: 'https://instagram.com/NFTDevelopments', icon: 'fab fa-instagram'},
            {id: 3, link: 'https://tiktok.com/@NFTDevelopments', icon: 'fab fa-tiktok'},
            {id: 4, link: 'https://www.youtube.com/channel/UCbPW7kuPqflfqplBZy8knsg', icon: 'fab fa-youtube'},
            {id: 5, link: 'https://www.linkedin.com/in/nft-developments-372a08222/', icon: 'fab fa-linkedin'},
            {id: 6, link: 'mailto:Enquire@NFTDevelopments.com', icon: 'fa fa-envelope'},
            {id: 7, link: 'https://t.me/NFTdevelopments', icon: 'fab fa-telegram'},
        ],
        widgetData_1: [
            {id: 1, text: 'Home', to: '/'},
            {id: 1, text: 'Collections', to: '/collections'},
            {id: 1, text: 'Marketplace', to: '/photo-marketplace'},
            {id: 1, text: 'Assets', to: '/my-photos'},
        ],
        widgetData_2: []
    }
    render() {
        return (
            <footer className="footer-area mt-2">
                {/* Footer Top */}
                <div className="footer-top">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-sm-6 col-lg-6 res-margin">
                                {/* Footer Items */}
                                <div className="footer-items">
                                    {/* Logo */}
                                    <a className="navbar-brand" href="/">
                                        <img src="/img/logo.png" style={{width: '150px'}} alt="" />
                                    </a>
                                    <p>NFT Developments are linking NFTs to real world assets.</p>
                                    {/* Social Icons */}
                                    <div className="social-icons d-flex">
                                        {this.state.socialData.map((item, idx) => {
                                            return (
                                                <a key={`sd_${idx}`} href={item.link}>
                                                    <i className={item.icon} />
                                                    <i className={item.icon} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-6 res-margin">
                                {/* Footer Items */}
                                <div className="footer-items">
                                    {/* Footer Title */}
                                    <h4 className="footer-title">Useful Links</h4>
                                    <ul>
                                        {this.state.widgetData_1.map((item, idx) => {
                                            return (
                                                <li key={`wdo_${idx}`}><a href={item.to}>{item.text}</a></li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <div className="container">
                            <div className="row">
                                <div className="col-12">
                                    {/* Copyright Area */}
                                    <div className="copyright-area d-flex flex-wrap justify-content-center justify-content-sm-between text-center py-4">
                                        {/* Copyright Left */}
                                        <div className="copyright-left">©2021 NFT Developments</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
