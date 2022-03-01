import React, { useEffect, useState, lazy, Suspense } from 'react';
import getWeb3 from '../../utils/getWeb3';

const Empty = lazy(() => import('./Empty'));
const TopSellerLoading = lazy(() => import('./Loading/TopSellerLoading'));

const authorlist= ({ data }) => {
    
    const [list, setList] = useState([]);
    const [web3,setWEB3] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setList(data);
    },[data]);

    useEffect(async() => {
        const { _web3 } = await getWeb3();
        setWEB3(_web3);
        setLoaded(true);
    },[])
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                { !loaded && <TopSellerLoading/> }
                {
                    loaded && (
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
                                                    <span>{item.firstName + "  " + item.lastName}</span>
                                                    <span className="bot">{web3.utils.fromWei((item.price).toString(), "ether")} ETH</span>
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
                    loaded && !list.length && <Empty/>
                }
            </Suspense>
        </>
    )
}
export default authorlist;