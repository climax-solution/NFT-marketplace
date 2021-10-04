import React, { Component } from 'react';
import { WalletConnect } from '../../store/action/wallet.actions';
import { connect } from 'react-redux';
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

class Header extends Component{
    constructor(props) {
        super(props);
        this.state = {
            wallet_connect: false
        }
    }
    async componentDidMount() {
        // await this.props.WalletConnect();
    }
    
    componentDidUpdate(preprops) {
        if (preprops != this.props) {
            const { wallet_connected } = this.props;
            this.setState({
                wallet_connect: wallet_connected
            })
        }
    }
    async connectWallet() {
        alert('YERS');
        await this.props.WalletConnect();
        alert('OK');
    }
    render() {
        const { wallet_connect } = this.state;
        return (
            <header id="header">
                {/* Navbar */}
                <nav data-aos="zoom-out" data-aos-delay={800} className="navbar navbar-expand">
                    <div className="container header">
                        {/* Navbar Brand*/}
                        <a className="navbar-brand" href="/">
                            <img className="navbar-brand-sticky" src="img/logo.png" alt="sticky brand-logo" />
                        </a>
                        <div className="ml-auto" />
                        {/* Navbar */}
                        <ul className="navbar-nav items ml-auto">
                            <li className="nav-item">
                                <a href="/" className="nav-link" >Home</a>
                            </li>
                            <li className="nav-item">
                                <a href="/photo-marketplace" className="nav-link">Marketplace</a>
                            </li>
                            <li className="nav-item">
                                <a href="/publish" className="nav-link">Mint</a>
                            </li>
                            <li className="nav-item">
                                <a href="/my-photos" className="nav-link">My Assets</a>
                            </li>
                        </ul>
                        {/* Navbar Toggler */}
                        <ul className="navbar-nav toggle">
                            <li className="nav-item">
                                <a href="#" className="nav-link" data-toggle="modal" data-target="#menu">
                                    <i className="fas fa-bars toggle-icon m-0" />
                                </a>
                            </li>
                        </ul>
                        {/* Navbar Action Button */}
                        <ul className="navbar-nav action">
                            {
                                !wallet_connect ? <li className="nav-item ml-3">
                                    <a className="btn ml-lg-auto" onClick={() => this.connectWallet()}>
                                        <i className="icon-wallet mr-md-2" />
                                    </a>
                                </li>
                                : <li className="nav-item ml-3">
                                    <i className="icon-user fa-2x"></i>
                                </li>
                            }
                        </ul>
                    </div>
                </nav>
            </header>
        )
    }
};
const mapStateToProps = ({wallet}) => ({
    wallet_connected: wallet.wallet_connected
})
const mapDispatchToProps = dispatch => ({
    WalletConnect: () => dispatch(WalletConnect())
})
export default connect(mapStateToProps, mapDispatchToProps)(Header);