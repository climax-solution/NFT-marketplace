import { useState } from "react";
import Select from 'react-select';
import { createGlobalStyle } from "styled-components"
import categories from "../../../../config/category.json";

const GlobalStyles = createGlobalStyle`
    .couple-column {
        grid-template-columns: auto auto;
        column-gap: 10px;
    }
`;

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

const categoryOptions = categories.slice(1, categories.length);

export default function Mint() {
    const [activeCategory, setCategory] = useState(categoryOptions[0]);

    return (
        <>
            <GlobalStyles/>
            <div className="row justify-content-center">
                <div className="col-sm-6 col-12">
                    <div className="nft__item p-5">
                        <div className="field-set">
                            <label>Metadata folder</label>
                            <input
                                type="text"
                                className="form-control"
                            />
                        </div>
                        <div className="field-set">
                            <label>Royalty Fee</label>
                            <input
                                type="text"
                                className="form-control"
                            />
                        </div>
                        <div className="field-set">
                            <label>Folder List</label>
                            <input
                                type="text"
                                className="form-control"
                            />
                        </div>
                        <div className="field-set">
                            <button className="btn-main py-3 w-25 mx-auto">MINT</button>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-12">
                    <div className="nft__item p-5">
                        <div className="field-set">
                            <label>Metadata folder</label>
                            <input
                                type="text"
                                className="form-control"
                            />
                        </div>
                        <div className="d-grid couple-column">
                            <div className="field-set">
                                <label>Royalty Fee</label>
                                <input
                                    type="text"
                                    className="form-control"
                                />
                            </div>
                            <div className="field-set">
                                <label>Category</label>
                                <Select
                                    className='select1'
                                    styles={customStyles}
                                    menuContainerStyle={{'zIndex': 999}}
                                    value={activeCategory}
                                    options={categoryOptions}
                                    onChange={(value) => {
                                        setCategory(value);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="field-set">
                            <label>Folder Name</label>
                            <input
                                type="text"
                                className="form-control"
                            />
                        </div>
                        <div className="field-set">
                            <button className="btn-main py-3 w-25 mx-auto">MINT</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}