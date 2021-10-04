import React, { Component } from 'react';

class Breadcrumb extends Component {
    render() {
        return (
            <section className="breadcrumb-area overlay-dark d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {/* Breamcrumb Content */}
                            <div className="breadcrumb-content text-center">
                                <h2 className="m-0">{this.props.title}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Breadcrumb;