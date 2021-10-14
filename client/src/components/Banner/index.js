import React, { Component } from 'react';

const initData = {
    pre_heading: "NetStorm",
    heading: "Discover, collect, and sell extraordinary NFTs",
    content: "Explore on the world's best & largest NFT marketplace",
    btn_1: "Explore",
    btn_2: "Create"
}

class Banner extends Component {
    state = {
        data: {}
    }
    componentDidMount(){
        this.setState({
            data: initData
        })
    }
    render() {
        return (
            <section className="hero-section">
                <div className="container">

                </div>
            </section>
        );
    }
}

export default Banner;