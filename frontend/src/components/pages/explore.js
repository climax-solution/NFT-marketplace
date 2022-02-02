import React, { useEffect, useState } from 'react';
import axios from "axios";
import Select from 'react-select'
import { createGlobalStyle } from 'styled-components';
import ColumnNew from '../components/ColumnNew';
import Footer from '../components/footer';
import getWeb3 from '../../utils/getWeb3';
import categoryOptions from "../../config/category.json";
import Loading from '../components/Loading';

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

const explore = () => {
  const [web3, setWeb3] = useState(null);
  const [NFT, setNFT] = useState(null);
  const [Marketplace, setMarketplace] = useState(null);
  const [folderList, setFolderList] = useState([]);
  const [activeCategory, setCategory] = useState({ value:'', label: 'All categories' });
  const [itemLoading, setItemLoading] = useState(true);
  const [searchKwd, setRealKwd] = useState('');
  const [tmpKwd, setTmpKwd] = useState('');

  useEffect(async() => {
    const { _web3, instanceNFT, instanceMarketplace } = await getWeb3();
    setWeb3(web3);
    setNFT(instanceNFT);
    setMarketplace(instanceMarketplace);
    
  },[])

  useEffect(async() => {
    if (!Marketplace) return;
    let gradList = await Marketplace.methods.getFolderList().call();
    let gradList1 = [];
    for(let idx in gradList) {
      gradList1.push({...gradList[idx], folderIndex: idx});
    };
    await getFolderData(gradList1);
  },[Marketplace])
  
  useEffect(async() => {
    if (!Marketplace) return;
    await filterFolder();
  },[activeCategory, searchKwd])

  const getFolderData = async(gradList) => {
    let mainList = [];
    for await (let item of gradList) {
      const URI = await NFT.methods.tokenURI(item[2][0]).call();
      try {
          const res = await axios.get(`${URI}`);
          mainList.push({ ...item, ...res.data });
      } catch (err) {
        console.log(err);
      }
    }
    setFolderList([...folderList, ...mainList]);
    setItemLoading(false);
  }

  const filterFolder = async() => {
    setItemLoading(true);
    let gradList = await Marketplace.methods.getFolderList().call();
    let gradList1 = [];
    for(let idx in gradList) {
      gradList1.push({...gradList[idx], folderIndex: idx});
    };
    gradList1 = gradList1.filter(item => ((item[0]).toLowerCase()).search(searchKwd.toLowerCase()) > -1);
    if (activeCategory.value) gradList1 = gradList1.filter(item => item[1] == activeCategory.value);
    await getFolderData(gradList1);
  }

  return(
    <div>
      <GlobalStyles/>
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
                            setFolderList([]);
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
                      setFolderList([]);
                    } }
                  />
                </div>
                {/* <div className='dropdownSelect two'><Select className='select1' styles={customStyles} defaultValue={options1[0]} options={options1} /></div> */}
                {/* <div className='dropdownSelect three'><Select className='select1' styles={customStyles} defaultValue={options2[0]} options={options2} /></div> */}
            </div>
          </div>
        </div>
        {
          itemLoading ? <Loading/> : <ColumnNew data={folderList}/>
        }
      </section>


      <Footer />
    </div>
  )
};
export default explore;