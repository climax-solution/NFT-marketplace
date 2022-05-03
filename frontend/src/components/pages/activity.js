import React, {useEffect, useState} from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import { createGlobalStyle } from 'styled-components';
import axios from 'axios';

import ActivityItem from "../components/Activity/row";
import Empty from '../components/Empty';
import ActivityLoading from '../components/Loading/ActivityLoading';

const GlobalStyles = createGlobalStyle`
  .activity-list li:after, .fa, .fas {
    font-family: "Font Awesome 5 Pro" !important;
  }
  .action-buy:after {
    content: "\f07a" !important;
  }

  .action-on-auction:after {
    content: "\f3c5" !important;
  }

  .action-down-auction:after {
    content: "\f605" !important;
  }

  .action-to-normal:after {
    content: "\f603" !important;
  }

  .action-to-premium:after {
    content: "\f601" !important;
  }

  .action-like:after {
    content: "\f004" !important;
  }

  .action-dislike:after {
    content: "\f7a9" !important;
  }

  .action-claim:after {
    content: "\f560" !important;
  }

  .action-sell:after {
    content: "\f54e" !important;
  }

  .action-down-sell:after {
    content: "\\e071" !important;
  }

  .action-make-bid:after {
    content: "\f658" !important;
  }

  .action-withdraw-bid:after {
    content: "\f2b6" !important;
  }

  .action-follow:after {
    content: "\f563" !important;
  }

  .action-disfollow:after {
    content: "\f564" !important;
  }

  .active i {
    color: white !important;
  }

  .react-loading-skeleton {
    background-color: #2a2b2c !important;
    background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
  }

  .mx-150px {
    max-width: 150px;
  }

  .w-100px {
    width: 100px !important;
  }

  .loading-item {
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    position: relative;
    padding-right: 100px;
    background: rgba(255, 255, 255, 0.025);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 0px 8px 0px rgb(0 0 0 / 30%);
  }

`;

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
        <GlobalStyles/>

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