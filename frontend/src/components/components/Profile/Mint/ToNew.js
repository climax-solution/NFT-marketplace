import { useState, useEffect } from 'react';
import ipfsAPI from "ipfs-api";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Select from 'react-select';
import getWeb3 from '../../../../utils/getWeb3';
import categories from "../../../../config/category.json";

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

export default function() {

    const initialUser = useSelector((state) => state.auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [NFT, setNFT] = useState();
    const [activeCategory, setCategory] = useState(categoryOptions[0]);
    const [folderHash, setFolderHash] = useState();
    const [royalty, setRoyalty] = useState();
    const [folderName, setFolderName] = useState();
    const [count, setCount] = useState('');
    const [isLoading, setLoading] = useState(false);

    const [hashStatus, setHashStatus] = useState('');
    const [royaltyStatus, setRoyaltyStatus] = useState('');
    const [nameStatus, setNameStatus] = useState('');
    const [countStatus, setCountStatus] = useState('');
    const [loadingStatus, setLoadingStatus] = useState('');

    useEffect(async() => {
        const { instanceNFT } = await getWeb3();
        setNFT(instanceNFT);
    },[])

    const mint = async() => {
        let message = "";
        if (!initialUser.walletAddress) message = "Please log in";
        else if (!wallet_info) message = 'Please connect metamask';

        if (message) {
            toast.warning(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }

        try {
            let flag = 0;
            if (!folderHash) {
                setHashStatus('This field is required.');
                flag = 1;
            } else setHashStatus('');

            if (royalty <= 0 || royalty > 10 || !royalty) {
                setRoyaltyStatus('Royalty is 0 ~ 10%.');
                flag = 1;
            } else setRoyaltyStatus('');

            if (!folderName) {
                setNameStatus('This field is required.');
                flag = 1;
            } else setNameStatus('');

            if (count < 1) {
                setCountStatus('This field is required than zero.');
                flag = 1;
            } else setCountStatus('');

            if (flag) throw Error();

            setLoading(true);
            setLoadingStatus('Checking metadata...');

            const ipfs = new ipfsAPI('ipfs.infura.io', 5001, {protocol: 'https'});
            const _existed = await ipfs.get(folderHash);
            let nftCount = _existed.length - 1;

            if (nftCount < count) {
                setHashStatus('Please choose correct folder. Metadata is not enough');
                throw Error();
            } else setHashStatus('');

            setLoadingStatus('Processing mint...');

            const result = await NFT.methods.bulkMint(folderHash, count, Math.floor(royalty * 100)).send({ from: initialUser.walletAddress });
            const lastID = Number(result.events.NFTMinted.returnValues.tokenId);

            setLoadingStatus('Creating new folder...');
            let list = [];
            for (let i = nftCount; i > 0; i --) list.push(lastID - i - 1);
            
            const newData = {
                name: folderName,
                artist: initialUser.username,
                category: activeCategory.value,
                list: list
            };

            await axios.post(`${process.env.REACT_APP_BACKEND}folder/create-new-items`, newData).then(res => {

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
        }
        setLoadingStatus('');
        setLoading(false);
    }

    return (
        <div className="new-panel">
            <div className="nft__item p-5 position-relative">
                {
                    isLoading && (
                        <div className="trade-loader start-0 w-100">
                            <div className="nb-spinner"></div>
                            <span className='loading-status'>{loadingStatus}</span>
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
                        <label>Count</label>
                        <input
                            type="number"
                            className="form-control mb-1"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                        />
                        <label className='text-danger f-12px'>{countStatus}</label>
                    </div>
                </div>
                <div className="couple-column">
                    <div className="field-set">
                        <label>Folder Name</label>
                        <input
                            type="text"
                            className="form-control mb-1"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                        />
                        <label className='text-danger f-12px'>{nameStatus}</label>
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
                    <button
                        className="btn-main py-3 w-25 mx-auto"
                        onClick={mint}
                    >MINT</button>
                </div>
            </div>
        </div>
    )
}