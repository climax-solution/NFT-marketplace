import React, { Component } from 'react';
import { WalletConnect } from '../../store/action/wallet.actions';
import { connect } from 'react-redux';
import getWeb3 from "../../utils/getWeb3";
import { ModalMenu, WalletMenu } from '../Modal';
import { NotificationManager } from "react-notifications";
import styles from "./header.module.scss";

class Header extends Component{
    constructor(props) {
        super(props);
        this.state = {
            wallet_connect: false,
            account: ''
        }
    }
    async componentDidMount() {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            if (!accounts.length) {
                window.localStorage.setItem("nftdevelopments",JSON.stringify({connected: false}))
            }
            this.setState({
                account: accounts[0]
            })

            await this.props.WalletConnect();
        } catch(err) {

        }
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
        try {
            const web3 = await getWeb3('click');
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const isMetaMask = accounts.length ? true : false;
            //console.log('isMetaMask+',isMetaMask);
            window.localStorage.setItem("nftdevelopments",JSON.stringify({connected: isMetaMask}));
            await this.props.WalletConnect();
            this.setState({
                account: accounts[0]
            })
        } catch(err) {
            if (err.code == 4001) {
                //console.log(err.message);
                NotificationManager.error(err.message, "Error");
            }
            else {
                NotificationManager.error("Metamask is not installed.", "Error");
            }
        }
    }

    async disconnectWallet() {
        const web3 = await getWeb3('click');
        const accounts = await web3.eth.getAccounts();
        window.localStorage.setItem("nftdevelopments",JSON.stringify({connected: false}));
        await this.props.WalletConnect();
    }
    render() {
        const { wallet_connect, account } = this.state;
        return (
            <header id="header">
                {/* Navbar */}
                <nav data-aos="zoom-out" data-aos-delay={800} className="navbar navbar-expand">
                    <div className="container header">
                        {/* Navbar Brand*/}
                        <a className="navbar-brand" href="/">
                            <img className="navbar-brand-sticky" src="/img/logo.png" alt="sticky brand-logo" />
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
                                (!wallet_connect || !account) ? <li className="nav-item ml-3">
                                    <a className={`ml-lg-auto ${styles.pointer}`} onClick={() => this.connectWallet()}>
                                        <i className="icon-wallet mr-md-2" />
                                    </a>
                                </li>
                                : (<li className="nav-item">
                                    <a className="nav-link" href="#" data-toggle="modal" data-target="#wallet-menu"><i className="icon-user fa-2x mr-md-2" /></a>
                                    <WalletMenu account={account} logOut={() => this.disconnectWallet()}/>
                                </li>)
                            }
                        </ul>
                    </div>
                </nav>
                <ModalMenu/>
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