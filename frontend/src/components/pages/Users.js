import React, { useEffect, useState, lazy } from 'react';
// import Select from 'react-select';
import { createGlobalStyle } from 'styled-components';
import axios from 'axios';

const UserList = lazy(() => import('../components/Users/UserList'));
const PremiumNFTLoading = lazy(() => import( '../components/Loading/PremiumNFTLoading'));
const Footer = lazy(() => import('../components/footer'));

const customStyles = {
  option: (base, state) => ({
    ...base,
    background: "#212428",
    color: "#fff",
    borderRadius: state.isFocused ? "0" : 0,
    "&:hover": {
      background: "#16181b",
    }
  }),
  menu: base => ({
    ...base,
    background: "#212428 !important",
    borderRadius: 0,
    marginTop: 0
  }),
  menuList: base => ({
    ...base,
    padding: 0
  }),
  control: (base, state) => ({
    ...base,
    padding: 2
  })
};

const GlobalStyles = createGlobalStyle`
  .items_filter {
    display: flex;
    align-items: center;
    #form_quick_search {
      height: 42px;
      top: 0;
      width: calc(100% - 200px);
      .form-control {
        width: calc(100% - 60px);
      }
    }
    .dropdownSelect {
      margin-bottom: 0;
    }
    @media only screen and (max-width: 768px) {
      .dropdownSelect {
        width: 200px;
      }
    }

    @media only screen and (max-width: 600px) {
      flex-direction: column;
      #form_quick_search {
        width: 100%;
        margin: 0;
        margin-bottom: 20px;
        .col {
          padding-left: 0;
        }
        #btn-submit {
          width: 60px;
        }
      }
      .dropdownSelect {
        width: 100%;
      }
      
    }
  }
`;

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
        <Footer />
      </>
    </div>
  )
};
export default Users;