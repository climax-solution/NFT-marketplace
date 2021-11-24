import React, { Component } from 'react';
import styles from '../../App.module.scss';

class Breadcrumb extends Component {
    render() {
        return (
            <section className="breadcrumb-area d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {/* Breamcrumb Content */}
                            <div className="breadcrumb-content text-center">
                                { this.props.img && <img src={`/img/${this.props.img}-ban-image.png`} style={{width: "150px"}}/> }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Breadcrumb;