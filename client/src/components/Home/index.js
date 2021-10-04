import React, { Component } from "react";
import { connect } from "react-redux";
import { SetStatus } from "../../store/action/wallet.actions";
import getWeb3 from "../../utils/getWeb3";
import Banner from "../Banner";
class Home extends Component {
    componentDidMount = async () => {
        try {
            const isProd = process.env.NODE_ENV === "production";
            if (!isProd) {
                // Get network provider and web3 instance.
                const web3 = await getWeb3("load");
                const isMetaMask = web3.currentProvider.isMetaMask;
                this.props.setConnection(isMetaMask);
            }
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.error(error);
        }       
    };
    render() {
        return(
            <Banner/>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setConnection: (status) => dispatch(SetStatus(status))
})
export default connect(null, mapDispatchToProps)(Home);