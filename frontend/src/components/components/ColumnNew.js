import React, { Component } from "react";
import { createGlobalStyle } from 'styled-components';

const GlobalStyles  = createGlobalStyle`
`;

export default class Responsive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 0,
            folderList: []
        };
        this.onImgLoad = this.onImgLoad.bind(this);
    }

    loadMore = () => {
    }

    onImgLoad({target:img}) {
        let currentHeight = this.state.height;
        if(currentHeight < img.offsetHeight) {
            this.setState({
                height: img.offsetHeight
            })
        }
    }
    
    componentDidUpdate(preProps) {
        if (preProps != this.props) {
            this.setState({
                folderList: this.props.data
            })
        }
    }

    render() {
        const { folderList, height } = this.state;
        return (
            <div className='row'>
                <GlobalStyles/>
                {folderList.map( (nft, index) => (
                    <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                        <div className="nft__item m-0 pb-4">
                            <div className="nft__item_wrap" style={{height: `${height}px`}}>
                                <a href={`/folder-explorer/${nft.folderIndex}`}>
                                    <img onLoad={this.onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                                </a>
                            </div>
                            <div className="nft__item_info mb-0">
                                <span onClick={()=> window.open(nft.nftLink, "_self")}>
                                    <h4>{nft.folder}</h4>
                                </span>
                            </div> 
                        </div>
                    </div>  
                ))}
            </div>              
        );
    }
}