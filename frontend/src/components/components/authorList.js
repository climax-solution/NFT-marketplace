import React, { useEffect, useState } from 'react';
import getWeb3 from '../../utils/getWeb3';
import Empty from './Empty';
import TopSellerLoading from './Loading/TopSellerLoading';

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
                                                    <img className="lazy ratio-1-1" src={`http://localhost:7060/avatar/${item?.avatar}`} alt="" crossOrigin='true'/>
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
        </>
    )
}
export default authorlist;