import { useState, useEffect } from 'react';
import ipfsAPI from "ipfs-api";
import validator from "validator";
import Select from 'react-select';
import getWeb3 from '../../../../utils/getWeb3';
import { warning_toastify, success_toastify, error_toastify } from "../../../../utils/notify";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { createGlobalStyle } from 'styled-components';

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
    .nft-art {
        padding: 40px 0;
        border: solid 1px rgba(255, 255, 255, 0.1);
        border-radius: 6px;
    }

    .w-300px {
        width: 300px !important;
    }
`;

export default function() {

    const initialUser = useSelector((state) => state.auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [NFT, setNFT] = useState();
    const [activeCategory, setCategory] = useState();
    const [folderList, setFolderList] = useState([]);
    const [nftName, setNFTName] = useState();
    const [royalty, setRoyalty] = useState();
    const [royaltyAddress, setRoyaltyAddress] = useState('');
    const [isLoading, setLoading] = useState(false);

    const [preview, setPreivew] = useState("/img/preview.png");
    const [asset, setAsset] = useState();

    const [nameStatus, setNameStatus] = useState('');
    const [royaltyStatus, setRoyaltyStatus] = useState('');
    const [loadingStatus, setLoadingStatus] = useState('');
    const [addressStatus, setAddressStatus] = useState('');

    useEffect(async() => {
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-list`).then(res => {
            let _list = [];
            const { list } = res.data;
            list.map(item => {
                _list.push({
                    value: item._id,
                    label: item.name,
                    description: item.description
                })
            });
            setFolderList(_list);
            setCategory(_list[0]);
        }).catch(err => {

        })
        const { instanceNFT } = await getWeb3();
        setNFT(instanceNFT);
    },[])

    const mint = async() => {
        let message = "";
        if (!initialUser.walletAddress) message = "Please log in";
        else if (!wallet_info) message = 'Please connect metamask';

        if (message) {
            warning_toastify(message);
            return;
        }

        try {
            let flag = 0;
            if (!nftName) {
                setNameStatus('This field is required.');
                flag = 1;
            } else setNameStatus('');

            if (royalty <= 0 || royalty > 10 || !royalty) {
                setRoyaltyStatus('Royalty is 0 ~ 10%.');
                flag = 1;
            } else setRoyaltyStatus('');


            if (!validator.isEthereumAddress(royaltyAddress) || !royaltyAddress) {
                setAddressStatus('Not valid account address');
                flag = 1;
            } else setAddressStatus('');

            if (flag) return;

            setLoading(true);
            setLoadingStatus('Checking metadata...');

            const ipfs = new ipfsAPI('ipfs.infura.io', 5001, {protocol: 'https'});
            const _existed = await ipfs.get(nftName);
            let nftCount = _existed.length - 1;

            setLoadingStatus('Processing mint...');

            const result = await NFT.methods.bulkMint(nftName, royaltyAddress, count, Math.floor(royalty * 100)).send({ from: initialUser.walletAddress });
            const lastID = Number(result.events.NFTMinted.returnValues.tokenId);
            
            let list = [];
            for (let i = count; i > 0; i --) list.push(lastID - i);
            
            const newData = {
                folderID: activeCategory.value,
                list: list
            };

            setLoadingStatus('Creating new folder...');

            await axios.post(`${process.env.REACT_APP_BACKEND}folder/add-items-to-old`, newData).then(res => {

            }).catch(err => {
                
            });
            success_toastify("Mint success")
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

            error_toastify(message);
        }

        setLoadingStatus('');
        setLoading(false);
    }

    const importAsset = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
    
            reader.onloadend = function (e) {
                setPreivew(reader.result);
                setAsset(file);
            }.bind(this);
        }
    }

    return (
        <>
            <GlobalStyles/>
            <div className="old-panel">
                <div className="nft__item p-5 position-relative">
                    {
                        isLoading && (
                            <div className="trade-loader start-0 w-100">
                                <div className="nb-spinner"></div>
                                <span className='loading-status'>{loadingStatus}</span>
                            </div>
                        )
                    }
                    <span className='d-block mb-2 text-white'>Mint Single NFT</span>
                    <div className='field-set cursor-pointer my-2'>
                        <label className='text-center nft-art d-block'>
                            Please choose NFT art
                            <input
                                type="file"
                                onChange={importAsset}
                                hidden
                            />
                        </label>
                    </div>
                    <div className="field-set">
                        <label>NFT name</label>
                        <input
                            type="text"
                            className="form-control mb-1"
                            value={nftName}
                            onChange={(e) => setNFTName(e.target.value)}
                        />
                        <label className='text-danger f-12px'>{nameStatus}</label>
                    </div>
                    <div className="couple-column">
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
                        <div className="field-set">
                            <label>Royalty Address</label>
                            <input
                                type="text"
                                className="form-control mb-1"
                                value={royaltyAddress}
                                onChange={(e) => setRoyaltyAddress(e.target.value)}
                            />
                            <label className='text-danger f-12px'>{addressStatus}</label>
                            </div>
                    </div>
                    <div className="field-set mb-1">
                        <label>Folder List</label>
                        <Select
                            className='select1'
                            styles={customStyles}
                            menuContainerStyle={{'zIndex': 999}}
                            value={activeCategory}
                            options={folderList}
                            onChange={(value) => {
                                setCategory(value);
                            }}
                        />
                        <label className='f-12px'></label>
                    </div>
                    <div className="field-set">
                        <label>Folder Description</label>
                        <textarea
                            type="text"
                            className="form-control mb-1 bg-transparent"
                            rows={4}
                            value={activeCategory?.description}
                        />
                    </div>
                </div>
            </div>
            <div className='old-panel'>
                <div className='nft__item'>
                    <label>Preview</label>
                    <img src={preview} className="ratio-1-1 w-300px"/>
                    <div className="field-set mt-2">
                        <button
                            className="btn-main py-3 w-100 mx-auto"
                            onClick={mint}
                        >MINT</button>
                    </div>
                </div>
            </div>
        </>
    )
}