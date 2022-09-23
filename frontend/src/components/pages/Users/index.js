import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserList from '../../components/Users/UserList';
import PremiumNFTLoading from  '../../components/Loading/PremiumNFTLoading';
import { createGlobalStyle } from 'styled-components';

import style from './style';
const GlobalStyles = createGlobalStyle`${style}`;

const Users = () => {
  const [orginList, setOriginList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchKwd, setRealKwd] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(async() => {
    await filterUser();
  },[searchKwd])

  const filterUser = async() => {
    setLoading(true);
    if (!searchKwd) {
      const _list = await axios.post(`${process.env.REACT_APP_BACKEND}user/get-users-list`).then(res => {
        return res.data.list;
      }).catch(err => {
        return [];
      });  
      setOriginList(_list);
      setUserList(_list);
    }
    else {
      const _key = searchKwd.trim().toLowerCase();
      let gradList = orginList.filter(item => ((item.name).toLowerCase()).search(_key) > -1 || item.username.toLowerCase().search(_key) > -1);
      setUserList(gradList);
    }
    setLoading(false);
  }

  return(
    <>
      <GlobalStyles/>
      <section className='jumbotron breadcumb no-bg'>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Users</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="items_filter justify-content-between">
          <div className="row ml-0" name="form_quick_search">
            <div className="input-group w-100 position-relative align-items-center flex-nowrap">
              <i className='fa fa-search icon position-absolute z-index-1 text-dark'/>
              <input
                type="text"
                className="form-control ps-5 mb-0 rounded-pill"
                id="keyword"
                name="keyword"
                placeholder="search user here..."
                value={searchKwd}
                onChange={(e) => setRealKwd(e.target.value)}
              />
            </div>
            <div className="clearfix"></div>
          </div>
        </div>
        {
          isLoading ? <PremiumNFTLoading/>
          : <UserList data={userList}/>
        }
      </section>
    </>
  )
};
export default Users;