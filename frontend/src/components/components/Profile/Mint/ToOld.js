import { useState, useEffect } from 'react';
import ipfsAPI from "ipfs-api";
import Select from 'react-select';
import getWeb3 from '../../../../utils/getWeb3';

import categories from "../../../../config/category.json";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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

export default function() {

    const initialUser = useSelector((state) => state.auth.user);

    const [NFT, setNFT] = useState();
    const [activeCategory, setCategory] = useState();
    const [categoryOptions, setCateogryOptions] = useState([]);
    const [folderHash, setFolderHash] = useState();
    const [royalty, setRoyalty] = useState();
    const [isLoading, setLoading] = useState(false);

    const [hashStatus, setHashStatus] = useState('');
    const [royaltyStatus, setRoyaltyStatus] = useState('');

    useEffect(async() => {
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-list`).then(res => {
            let _list = [];
            const { list } = res.data;
            list.map(item => {
                _list.push({
                    value: item._id,
                    label: item.name
                })
            });
            setCateogryOptions(_list);
            setCategory(_list[0]);
        }).catch(err => {

        })
        const { instanceNFT } = await getWeb3();
        setNFT(instanceNFT);
    },[])

    const mint = async() => {
        try {
            setLoading(true);
            let flag = 0;
            if (!folderHash) {
                setHashStatus('This field is required.');
                flag = 1;
            } else setHashStatus('');

            if (royalty <= 0 || royalty > 10 || !royalty) {
                setRoyaltyStatus('Royalty is 0 ~ 10%.');
                flag = 1;
            } else setRoyaltyStatus('');

            if (flag) throw Error();

            const ipfs = new ipfsAPI('ipfs.infura.io', 5001, {protocol: 'https'});
            const _existed = await ipfs.get(folderHash);
            let nftCount = _existed.length - 1;

            if (!nftCount) {
                setHashStatus('Please choose folder.');
                throw Error();
            } else setHashStatus('');

            const result = await NFT.methods.bulkMint(folderHash, nftCount, Math.floor(royalty * 100)).send({ from: initialUser.walletAddress });
            const lastID = Number(result.events.NFTMinted.returnValues.tokenId);
            console.log(lastID);
            
            let list = [];
            for (let i = nftCount; i > 0; i ++) list.push(lastID - i - 1);
            
            const newData = {
                folderID: activeCategory.value,
                list: list
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}folder/add-items-to-old`, newData).then(res => {

            }).catch(err => {
                
            });
            toast.success("Mint success", {
                theme: "colored",
                autoClose: 2000
            })
        } catch(err) {
            if (err.message) {
                toast.error(err.message, {
                    theme: "colored",
                    autoClose: 2000
                })
            }
            setLoading(false);
        }
    }

    return (
        <div className="col-sm-6 col-12">
            <div className="nft__item p-5 position-relative">
                {
                    isLoading && (
                        <div className="trade-loader start-0 w-100">
                            <div className="nb-spinner"></div>
                        </div>
                    )
                }
                <div className="field-set">
                    <label>Metadata folder</label>
                    <input
                        type="text"
                        className="form-control mb-1"
                        value={folderHash}
                        onChange={(e) => setFolderHash(e.target.value)}
                    />
                    <label className='text-danger f-12px'>{hashStatus}</label>
                </div>
                <div className="field-set">
                    <label>Royalty Fee</label>
                    <input
                        type="number"
                        className="form-control mb-1"
                        value={royalty}
                        onChange={(e) => setRoyalty(e.target.value)}
                    />
                    <label className='text-danger f-12px'>{royaltyStatus}</label>
                </div>
                <div className="field-set mb-1">
                    <label>Folder List</label>
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
                    <label className='f-12px'></label>
                </div>
                <div className="field-set">
                    <button
                        className="btn-main py-3 w-25 mx-auto"
                        onClick={mint}
                    >MINT</button>
                </div>
            </div>
        </div>
    )
}