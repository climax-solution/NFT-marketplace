import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { NotificationContainer } from "react-notifications";
import { Loader } from 'rimble-ui';
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import MyPhotos from "./components/MyPhotos/index.js";
import PhotoMarketplace from "./components/PhotoMarketplace/index.js";
import ItemDetails from "./components/ItemDetails/ItemDetails";
import Home from "./components/Home";
import FolderItem from "./components/FolderItem/index.js";
import Collections from "./components/Collection/index.js";
import SubCollection from "./components/SubCollection/index.js";

import 'react-notifications/lib/notifications.css';
import styles from './App.module.scss';
import './App.css';

class App extends Component {
  constructor(props) {    
    super(props);

    this.state = {
      /////// Default state
      storageValue: 0,
      web3: null,
      accounts: null,
    };
  }

  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck(instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.<br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
      </div>
    );
  }


  render() {
    return (
      <Router >
        <Header />
        <NotificationContainer/>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/my-photos" component={MyPhotos}/>
            <Route path="/collections" component={Collections}/>
            <Route path="/photo-marketplace" component={PhotoMarketplace}/>
            <Route path="/item-details/:id" component={ItemDetails}/>
            <Route path="/folder-item/:id" component={FolderItem}/>
            <Route path="/sub-collection/:id" component={SubCollection}/>
          </Switch>
        <Footer />
      </Router>
    );
  }
}

export default App;
