import React, { useEffect, useState } from 'react';
// import Select from 'react-select';
import axios from 'axios';

import UserList from '../../components/Users/UserList';
import PremiumNFTLoading from  '../../components/Loading/PremiumNFTLoading';
import "./style.module.css";

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [activeCategory, setCategory] = useState({ value:'', label: 'All categories' });
  const [searchKwd, setRealKwd] = useState('');
  const [tmpKwd, setTmpKwd] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(async() => {
    await filterFolder();
  },[activeCategory, searchKwd])

  const filterFolder = async() => {
    setLoading(true);
    let gradList = await axios.post(`${process.env.REACT_APP_BACKEND}user/get-users-list`).then(res => {
      return res.data.list;
    }).catch(err => {
      return [];
    });

    // gradList = gradList.filter(item => ((item.name).toLowerCase()).search(searchKwd.toLowerCase()) > -1);
    // if (activeCategory.value) gradList = gradList.filter(item => item.category == activeCategory.value);
    setUserList(gradList);
    setLoading(false);
  }

  return(
    <div>
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
        {/* <div className='row'>
          <div className='col-lg-12'>
              <div className="items_filter justify-content-between">
                <div className="row form-dark" id="form_quick_search" name="form_quick_search">
                    <div className="col">
                        <input
                          className="form-control"
                          id="name_1"
                          name="name_1"
                          placeholder="search item here..."
                          type="text"
                          value={tmpKwd}
                          onChange={(e) => setTmpKwd(e.target.value)}
                        />
                        <button
                          id="btn-submit"
                          onClick={() => {
                            setRealKwd(tmpKwd);
                            // setUserList([]);
                          }}
                        >
                          <i className="fa fa-search bg-color-secondary"></i>
                        </button>
                        <div className="clearfix"></div>
                    </div>
                </div>
                <div className='dropdownSelect one'>
                  <Select
                    className='select1'
                    styles={customStyles}
                    menuContainerStyle={{'zIndex': 999}}
                    value={activeCategory}
                    options={categoryOptions}
                    onChange={(value) => {
                      setCategory(value);
                      // setUserList([]);
                    }}
                  />
                </div>
            </div>
          </div>
        </div> */}
        {
          isLoading ? <PremiumNFTLoading/>
          : <UserList data={userList}/>
        }
      </section>
    </div>
  )
};
export default Users;