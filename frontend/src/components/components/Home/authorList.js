import axios from 'axios';
import React, { useEffect, useState } from 'react';
import getWeb3 from '../../../utils/getWeb3';

import Empty from '../Empty';
import TopSellerLoading from '../Loading/TopSellerLoading';
import Buyer from './buyer';

const AuthorList= () => {
    
    const [list, setList] = useState([]);
    const [web3,setWEB3] = useState({});
    const [isLoading, setLoading] = useState(true);

    useEffect(async() => {
        const { _web3 } = await getWeb3();
        setWEB3(_web3);
        await axios.post(`${process.env.REACT_APP_BACKEND}activity/get-top-sellers`).then(res => {
            setList(res.data);
        }).catch(err => {

        })
        setLoading(false);
    },[]);
    return (
        <section className='container no-top no-bottom'>
          <div className='row'>
            <div className="spacer-double"></div>
            <div className='col-lg-12'>
                <h2>Top Sellers</h2>
            </div>
            <div className='col-lg-12 mt-5'></div>
            <>
                { isLoading && <TopSellerLoading/> }
                {
                    !isLoading && (
                        <div>
                            <ol className="author_list">
                                {
                                    list.map((item, index) => {
                                        return (
                                            <Buyer key={index} user={item} web3={web3}/>
                                        )
                                    })
                                }
                            </ol>
                        </div>
                    )
                }

                {
                    !isLoading && !list.length && <Empty/>
                }
            </>
            </div>
        </section>
    )
}
export default AuthorList;