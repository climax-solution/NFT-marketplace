import React from 'react';
import './custom.css';
const WalletMenu = ({ account, logOut}) => {
    return (
        <div id="wallet-menu" className="modal fade p-0">
            <div className="modal-dialog dialog-animated">
                <div className="modal-content h-100">
                    <div className="modal-header" data-dismiss="modal">
                        Wallet Menu <i className="far fa-times-circle icon-close" />
                    </div>
                    <div className="menu modal-body">
                        <div className="row w-100">
                            <div className="items p-0 col-12 text-left" >
                                <ul className="navbar-nav">
                                    <li className="nav-item">
                                        <small className="nav-link">{account.substr(0,14) + "..." + account.substr(-4)}</small>
                                    </li>
                                    <li className="nav-item">
                                        <small className="nav-link justify-content-start logout-btn" onClick={() => logOut()}>
                                            <i className="icon-logout text-white mr-2"/>Log Out
                                        </small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletMenu;