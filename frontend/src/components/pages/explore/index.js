import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import categoryOptions from "../../../config/category.json";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { filterDropdown } from "../../../config/styles.js";
import { createGlobalStyle } from "styled-components";
import FolderList from '../../components/Explore/FolderList';
import PremiumNFTLoading from '../../components/Loading/PremiumNFTLoading';
import style from "./style.js";
const GlobalStyle = createGlobalStyle`${style}`;

const Explore = () => {

  const initialUser = useSelector(({ auth }) => auth.user);
  const [folderList, setFolderList] = useState([]);
  const [activeCategory, setCategory] = useState({ value:'', label: 'All categories' });
  const [searchKwd, setRealKwd] = useState('');
  const [tmpKwd, setTmpKwd] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(async() => {
    await filterFolder();
  },[activeCategory, searchKwd])

  const filterFolder = async() => {
    setLoading(true);
    let gradList = await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-sale-folder-list`, {user: initialUser?.username ? initialUser.username: ""}).then(res => {
      return res.data.list;
    }).catch(err => {
      return [];
    });

    gradList = gradList.filter(item => ((item.name).toLowerCase()).search(searchKwd.toLowerCase()) > -1);
    if (activeCategory.value) gradList = gradList.filter(item => item.category == activeCategory.value);
    setFolderList(gradList);
    setLoading(false);
  }

  return(
    <>
      <GlobalStyle/>
      <section className='jumbotron breadcumb no-bg'>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Explore</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
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
                            // setFolderList([]);
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
                    styles={filterDropdown}
                    menuContainerStyle={{'zIndex': 999}}
                    value={activeCategory}
                    options={categoryOptions}
                    onChange={(value) => {
                      setCategory(value);
                      // setFolderList([]);
                    }}
                  />
                </div>
            </div>
          </div>
        </div>
        { isLoading ? <PremiumNFTLoading/> : <FolderList data={folderList}/> }
      </section>
    </>
  )
};
export default Explore;