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
                                <h2 className={`m-0 ${styles['shadow-blue']}`}>{this.props.title}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Breadcrumb;