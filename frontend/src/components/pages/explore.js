import React from 'react';
import Select from 'react-select'
import { createGlobalStyle } from 'styled-components';
import ColumnNew from '../components/ColumnNew';
import Footer from '../components/footer';

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


const options = [
  { value: 'All categories', label: 'All categories' },
  { value: 'physical', label: 'Physical Assets'},
  { value: 'digital', label: 'Digital Assets'},
  { value: 'art', label: 'Art' },
  { value: 'muic', label: 'Music' },
  { value: 'video', label: 'Video' },
]
const options1 = [
  { value: 'Buy Now', label: 'Buy Now' },
  { value: 'On Auction', label: 'On Auction' },
  { value: 'Has Offers', label: 'Has Offers' }
]
const options2 = [
  { value: 'All Items', label: 'All Items' },
  { value: 'Single Items', label: 'Single Items' },
  { value: 'Bundles', label: 'Bundles' }
]

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

const explore= () => (
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
            <form className="row form-dark" id="form_quick_search" name="form_quick_search">
                <div className="col">
                    <input className="form-control" id="name_1" name="name_1" placeholder="search item here..." type="text" /> <button id="btn-submit"><i className="fa fa-search bg-color-secondary"></i></button>
                    <div className="clearfix"></div>
                </div>
            </form>
            <div className='dropdownSelect one'><Select className='select1' styles={customStyles} menuContainerStyle={{'zIndex': 999}} defaultValue={options[0]} options={options} /></div>
            {/* <div className='dropdownSelect two'><Select className='select1' styles={customStyles} defaultValue={options1[0]} options={options1} /></div> */}
            {/* <div className='dropdownSelect three'><Select className='select1' styles={customStyles} defaultValue={options2[0]} options={options2} /></div> */}
        </div>
      </div>
    </div>
    <ColumnNew/>
  </section>


  <Footer />
</div>

);
export default explore;