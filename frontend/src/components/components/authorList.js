import axios from 'axios';
import React, { useEffect, useState, lazy, Suspense } from 'react';
import getWeb3 from '../../utils/getWeb3';

const Empty = lazy(() => import('./Empty'));
const TopSellerLoading = lazy(() => import('./Loading/TopSellerLoading'));

const authorlist= () => {
    
    const [list, setList] = useState([]);
    const [web3,setWEB3] = useState({});
    const [isLoading, setLoading] = useState(true);
    useEffect(async() => {
        const { _web3 } = await getWeb3();
        setWEB3(_web3);
        await axios.post('http://nftdevelopments.co.nz/activity/get-top-sellers').then(res => {
            setList(res.data);
        }).catch(err => {
        })
        setLoading(false);
    },[])
    return (
        <section className='container no-top no-bottom'>
          <div className='row'>
            <div className="spacer-double"></div>
            <div className='col-lg-12'>
                <h2>Top Sellers</h2>
            </div>
            <div className='col-lg-12 mt-5'></div>
            <Suspense fallback={<TopSellerLoading/>}>
                { isLoading && <TopSellerLoading/> }
                {
                    !isLoading && (
                        <div>
                            <ol className="author_list">
                                {
                                    list.map((item, index) => {
                                        return (
                                            <li key={index}>
                                                <div className="author_list_pp">
                                                    <span>
                                                        <img className="lazy ratio-1-1" src={`http://nftdevelopments.co.nz/avatar/${item?.avatar}`} alt="" crossOrigin='true'/>
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>                                    
                                                <div className="author_list_info">
                                                    <span>{item.firstName + "  " + item.lastName}</span><br/>
                                                    <span className="bot d-inline-block">{web3.utils.fromWei((item.price).toString(), "ether")} BNB</span>
                                                </div>
                                            </li>
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
            </Suspense>
            </div>
        </section>
    )
}
export default authorlist;