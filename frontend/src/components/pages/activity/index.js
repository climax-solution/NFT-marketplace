import React, {useEffect, useState} from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import axios from 'axios';

import ActivityItem from "../../components/Activity/row";
import Empty from '../../components/Empty';
import ActivityLoading from '../../components/Loading/ActivityLoading';
import "./style.css";

const Activity= function() {

  const [activeTab, setActiveTab] = useState('');
  const [items, setLogs] = useState([]);
  const [moreItems, setMoreItems] = useState(true);

  const _loadNextPage = async() => {
    await axios.get(`${process.env.REACT_APP_BACKEND}activity/get-logs?b=${items.length}&type=${activeTab}`).then(res => {
      const { data } = res;
      if (data.length) {
        setLogs([...items, ...data]);
        setMoreItems(true);
      }
      else setMoreItems(false);
    }).catch(err => {
      setLogs([]);
      setMoreItems(false);
    })
  };

  useEffect(async() => {
    await _loadNextPage();
  },[activeTab])

  return (
    <div>
      <>
        <section className='jumbotron breadcumb no-bg'>
          <div className='mainbreadcumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center'>Activity</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container'>
          <div className='row'>

            <div className="col-md-4">
              <span className="filter__l">Filter</span>
              <span className="filter__r" onClick={() =>setActiveTab('')}>Reset</span>
              <div className="spacer-half"></div>
              <div className="clearfix"></div>
              <ul className="activity-filter">
                  <li id='sale' className={activeTab === 0 ? "active" : ""} onClick={() => { setLogs([]); setActiveTab(0); }}><i className="fa fa-shopping-basket"></i>Sales</li>
                  <li id='like' className={activeTab === 1 ? "active" : ""} onClick={() => { setLogs([]); setActiveTab(1); }}><i className="fa fa-heart"></i>Likes</li>
                  <li id='offer' className={activeTab === 2 ? "active" : ""} onClick={() => { setLogs([]); setActiveTab(2); }}><i className="fa fa-gavel"></i>Offers</li>
                  <li id='follow' className={activeTab === 3 ? "active" : ""} onClick={() => { setLogs([]); setActiveTab(3); }}><i className="fa fa-cookie"></i>Followings</li>
              </ul>
            </div>

            <div className="col-md-8">
                <InfiniteScroll
                  dataLength={items.length}
                  next={_loadNextPage}
                  hasMore={moreItems}
                  loader={<ActivityLoading/>}
                  className='activity-list'
                >
                  {
                    items.map((item, idx) => <ActivityItem key={idx} data={item}/>)
                  }
                </InfiniteScroll>
                {
                  !items.length && !moreItems && <Empty/>
                }
            </div>
          </div>
        </section>

      </>
    </div>

  );
}

export default Activity;