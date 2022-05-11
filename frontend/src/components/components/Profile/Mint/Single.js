import { useState, useEffect } from 'react';
import ipfsAPI from "ipfs-api";
import Modal from 'react-awesome-modal';
import validator from "validator";
import Select from 'react-select';
import getWeb3 from '../../../../utils/getWeb3';
import { warning_toastify, success_toastify, error_toastify } from "../../../../utils/notify";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Checkbox } from 'pretty-checkbox-react';
import detects from "detect-file-type";
import { filterDropdown } from "../../../../config/styles.js";
import '@djthoms/pretty-checkbox';
import categories from "../../../../config/category.json";
import MusicArt from '../../Asset/music';
import "./single.css";

const categoryOptions = categories.slice(1, categories.length);
const image_ext = ['jpg', 'png', 'gif'];
const audio_ext = ['mp3', 'wav', 'ogg'];
const video_ext = ['mp4', 'avi', 'webm'];

export default function SingleMint() {

    const initialUser = useSelector((state) => state.auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [NFT, setNFT] = useState();
    const [activeFolder, setActiveFolder] = useState();
    const [folderList, setFolderList] = useState([]);
    const [nftName, setNFTName] = useState();
    const [nftDesc, setNFTDescription] = useState('');
    const [royalty, setRoyalty] = useState();
    const [royaltyAddress, setRoyaltyAddress] = useState('');
    const [folderName, setFolderName] = useState('');
    const [folderDesc, setFolderDesc] = useState('');
    const [fileType, setFileType] = useState('image');
    const [folderStatus, setFolderStatus] = useState({
        name: "",
        desc: ""
    })
    const [isLoading, setLoading] = useState(false);

    const [preview, setPreivew] = useState("/img/preview.png");
    const [musicPre, setMusicPre] = useState('');
    const [musicPreArt, setMusicPreArt] = useState('');
    const [asset, setAsset] = useState();

    const [assetStatus, setAssetStatus] = useState(false);
    const [nameStatus, setNameStatus] = useState('');
    const [royaltyStatus, setRoyaltyStatus] = useState('');
    const [loadingStatus, setLoadingStatus] = useState('');
    const [addressStatus, setAddressStatus] = useState('');
    const [activeCategory, setCategory] = useState(categoryOptions[0]);

    const [visible, setOpenModal] = useState(false);
    const [willCreate, setWillCreate] = useState(false);
    const [attributes, setAttributes] = useState([{
        "trait_type": "",
        "value": ""
    }]);

    const [tmpAttrs, setTmpAttrs] = useState([{
        "trait_type": "",
        "value": ""
    }]);

    useEffect(async() => {
        await axios.post(`${process.env.REACT_APP_BACKEND}folder/get-folder-list`, { artist: initialUser.username }).then(res => {
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
            setActiveFolder(_list[0]);
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
            

            if (fileType == 'music' && !musicPreArt) {
                flag = 1;
                setAssetStatus(true);
            } else setAssetStatus(false);

            if (!asset) {
                flag = 1;
                setAssetStatus(true);
            } else setAddressStatus(false);

            if (!nftName) {
                setNameStatus('This field is required.');
                flag = 1;
            } else setNameStatus('');

            if (royalty <= 0 || royalty > 10 || !royalty) {
                setRoyaltyStatus('Royalty is 0 ~ 10%.');
                flag = 1;
            } else setRoyaltyStatus('');

            if (willCreate) {
                if (!folderName) {
                    setFolderStatus({ ...folderStatus, name: "This field is required."});
                    flag = 1;
                }
                
            } else {
                setFolderStatus({ ...folderStatus, name: "" });
            }

            if (!validator.isEthereumAddress(royaltyAddress) || !royaltyAddress) {
                setAddressStatus('Not valid account address');
                flag = 1;
            } else setAddressStatus('');

            if (flag) return;

            setLoading(true);
            setLoadingStatus('Uploading metadata...');

            const ipfs = new ipfsAPI('ipfs.infura.io', 5001, {protocol: 'https'});

            const art = await ipfs.files.add(asset);

            let metadata = {
                nftName,
                nftDesc,
                asset: `https://ipfs.io/ipfs/${art[0].hash}`,
                type: fileType,
                attributes
            };

            if (fileType == 'music') {
                const _preArt = await ipfs.files.add(musicPreArt);
                metadata = { ...metadata, image: 'https://ipfs.io/ipfs/' + _preArt[0].hash };
            }

            const uploaded = await ipfs.files.add(Buffer.from(JSON.stringify(metadata)));
            const tokenURI = 'https://ipfs.io/ipfs/' + uploaded[0].hash;
            setLoadingStatus('Processing mint...');

            const result = await NFT.methods.singleMint(tokenURI, royaltyAddress, Math.floor(royalty * 100)).send({
                from: initialUser.walletAddress,
                value: "10000000000000000"
            });
            const lastID = Number(result.events.NFTMinted.returnValues.tokenId);
                        
            let newData = {
                folderID: activeFolder.value,
                list: [lastID - 1]
            };

            let api = `${process.env.REACT_APP_BACKEND}folder/add-items-to-old`;
            if (willCreate) {
                setLoadingStatus('Creating new folder...');
                newData = {
                    list: [lastID - 1],
                    name: folderName,
                    artist: initialUser.username,
                    description: folderDesc,
                    category: activeCategory.value
                };
                api = `${process.env.REACT_APP_BACKEND}folder/create-new-items`;
            }
            else setLoadingStatus('Adding NFT to folder...');

            await axios.post(api, newData).then(res => {

            }).catch(err => {
                
            });
            success_toastify("Mint success");
        } catch(err) {
            console.log(err);
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

            error_toastify(message);
        }

        setLoadingStatus('');
        setLoading(false);
    }

    const importAsset = async(e) => {
        const file = e.target.files[0];
        if (file) {
            const saveReader = new window.FileReader();

            saveReader.readAsArrayBuffer(file);
            saveReader.onloadend = async function (evt) {
                await detects.fromBuffer(Buffer(saveReader.result), (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const { ext } = result;
                        let flag = 0;
                        if (image_ext.indexOf(ext) > -1)  {
                            setFileType('image');
                            flag = 1;
                        }
                        else if (audio_ext.indexOf(ext) > -1)  {
                            setFileType('music');
                            flag = 1;
                        }
                        else if (video_ext.indexOf(ext) > -1)  {
                            setFileType('video');
                            flag = 1;
                        }

                        if (flag) {
                            setPreivew(window.URL.createObjectURL(file))
                            setAsset(Buffer(saveReader.result));
                            setAddressStatus(false);
                        }
                    }
                });
                
            }.bind(this);
        }
    }

    const changeAttr = (key, value, index) => {
        let attrs = [ ...tmpAttrs ];
        attrs[index][key] = value;
        setTmpAttrs(attrs);
    }

    const removeRow = (index) => {
        let attrs = [...tmpAttrs];
        attrs.splice(index, 1);
        if (!attrs.length) {
            attrs = [{
                "trait_type": "",
                "value": ""
            }];
        }

        setTmpAttrs(attrs);
    }

    const closeModal = () => {
        setTmpAttrs(attributes);
        setOpenModal(false);
    }

    const saveAttributes = () => {
        let tmpList = [...tmpAttrs];
        for (let i = tmpList.length - 1; i >= 0; i --) {
            let item = tmpList[i];
            const trait_type = (item.trait_type).trim();
            const value = (item.value).trim();

            if (!trait_type || !value) {
                tmpList.splice(i, 1);
            }
        }

        if (!tmpList.length) {
            tmpList = [{
                "trait_type": "",
                "value": ""
            }];
        }

        setAttributes(tmpList);
        setTmpAttrs(tmpList);
        setOpenModal(false);
    }

    const importBGArt = (e) => {
        const file = e.target.files[0];
        if (file) {
            const saveReader = new window.FileReader();

            saveReader.readAsArrayBuffer(file);
            saveReader.onloadend = async function (evt) {
                await detects.fromBuffer(Buffer(saveReader.result), (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const { ext } = result;
                        if (image_ext.indexOf(ext) > -1)  {
                            setMusicPre(window.URL.createObjectURL(file));
                            setMusicPreArt(Buffer(saveReader.result));
                        }
                    }
                });
                
            }.bind(this);
        }
    }

    return (
        <>
            <div className="old-panel">
                <div className="nft__item p-5 position-relative">
                    <div className='d-flex mb-2 justify-content-between align-items-center'>
                        <span className='d-block text-white'>Mint Single NFT</span>
                        <Checkbox
                            color='danger-o'
                            shape='round'
                            bigger
                            onChange={() => setWillCreate(!willCreate)}
                        >Add New Folder</Checkbox>
                    </div>
                    <div className='field-set cursor-pointer my-2'>
                        <label className={`${assetStatus ? "border-danger text-danger" : ""} w-100 btn-main text-center nft-art d-block`}>
                            Please choose NFT art
                            <input
                                type="file"
                                accept="audio/*,video/*,image/*"
                                onChange={importAsset}
                                hidden
                            />
                        </label>
                    </div>
                    {
                        (fileType == 'music' && asset) ?
                        <div className='field-set cursor-pointer my-2'>
                            <label className={`${assetStatus ? "border-danger text-danger" : ""} w-100 btn-main text-center nft-art d-block`}>
                                Please choose background art
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={importBGArt}
                                    hidden
                                />
                            </label>
                        </div>
                        : ""
                    }
                    <div className="field-set">
                        <label>NFT name</label>
                        <input
                            type="text"
                            className={`${nameStatus ? "border-danger" : ""} form-control mb-1`}
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
                                className={`${royaltyStatus ? "border-danger" : ""} form-control mb-1`}
                                value={royalty}
                                onChange={(e) => setRoyalty(e.target.value)}
                            />
                            <label className='text-danger f-12px'>{royaltyStatus}</label>
                        </div>
                        <div className="field-set">
                            <label>Royalty Address</label>
                            <input
                                type="text"
                                className={`${addressStatus ? "border-danger" : ""} form-control mb-1`}
                                value={royaltyAddress}
                                onChange={(e) => setRoyaltyAddress(e.target.value)}
                            />
                            <label className='text-danger f-12px'>{addressStatus}</label>
                        </div>
                    </div>
                    <div className='field-set properties-group'>
                        <div className='text d-flex'>
                            <div>
                                <i className='fa fa-list-ul'/>
                            </div>
                            <div className='ms-2'>
                                <span>Properties</span><br/>
                                <span>Textual traits that show up as rectangles</span>
                            </div>
                        </div>
                        <span className='open-btn' onClick={() => setOpenModal(true)}><i className='fa fa-plus'/></span>
                    </div>
                    {
                        !willCreate ? 
                            <div className="field-set mt-3">
                                <label>Folder List</label>
                                <Select
                                    className='select1'
                                    styles={filterDropdown}
                                    menuContainerStyle={{'zIndex': 999}}
                                    value={activeFolder}
                                    options={folderList}
                                    onChange={(value) => {
                                        setActiveFolder(value);
                                    }}
                                />
                                <label className='f-12px'></label>
                            </div>
                        : <>
                            <div className='field-set mt-3'>
                                <label>Folder Name</label>
                                <input
                                    type="text"
                                    className={`${folderStatus.name ? "border-danger" : ""} form-control mb-1`}
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                />
                                <label className='text-danger f-12px'>{folderStatus.name}</label>
                            </div>
                            <div className="field-set">
                                <label>Category</label>
                                <Select
                                    className='select1'
                                    styles={filterDropdown}
                                    menuContainerStyle={{'zIndex': 999}}
                                    value={activeCategory}
                                    options={categoryOptions}
                                    onChange={(value) => {
                                        setCategory(value);
                                    }}
                                />
                            </div>
                            <div className="field-set">
                                <label>Folder Description</label>
                                <textarea
                                    type="text"
                                    className="form-control mb-1 bg-transparent text-white"
                                    rows={4}
                                    value={folderDesc}
                                    onChange={(e) => setFolderDesc(e.target.value)}
                                />
                            </div>
                        </>
                    }
                    <div className="field-set">
                        <label>NFT Description</label>
                        <textarea
                            type="text"
                            className="form-control mb-1 bg-transparent text-white"
                            rows={4}
                            value={nftDesc}
                            onChange={(e) => setNFTDescription(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className='old-panel w-300px'>
                <div className='nft__item align-items-center'>
                    {
                        fileType == 'image' ? <img src={preview} className="ratio-1-1 w-100"/>
                        : (
                            fileType == 'video' ? <video src={preview} controls className="ratio-1-1 w-100 h-100 preview-video"/>
                            : <MusicArt
                                tokenID={'#'}
                                image={musicPre}
                                asset={asset}
                                redirect="#"
                            />
                        )
                    }
                    <div className="field-set mt-2 w-100">
                        <button
                            className="btn-main py-3 w-100 mx-auto"
                            onClick={mint}
                        >MINT</button>
                    </div>
                </div>
            </div>
            <Modal
                visible={visible}
                width="500"
                effect="fadeInUp"
                onClickAway={closeModal}
            >
                <div className='modal-header'>
                    <p className='text-center m-0'>Add Properties</p>
                    <span onClick={closeModal}><i className='fa fa-times'/></span>
                </div>
                <div className='modal-body'>
                    <p>Properties show up underneath your item, are clickable, and can be filtered in your collection's sidebar.</p>
                    <div className='d-flex justify-content-between'>
                        <div className='text-start w-50'>Type</div>
                        <div className='text-start w-50'>Name</div>
                    </div>
                    <div className='attr-list'>
                        {
                            tmpAttrs.map((item, index) => {
                                return (
                                    <div className='attr-item mt-2' key={index}>
                                        <span className='remove-row' onClick={() => removeRow(index)}>
                                            <i className='far fa-times-circle'/>
                                        </span>
                                        <input
                                            type="text"
                                            className='form-control mb-0 border-grey text-dark'
                                            placeholder='Character'
                                            value={item.trait_type}
                                            onChange={(e) => changeAttr("trait_type",e.target.value, index)}
                                        />
                                        <input
                                            type="text"
                                            className='form-control mb-0 border-grey text-dark'
                                            placeholder='Male'
                                            value={item.value}
                                            onChange={(e) => changeAttr("value", e.target.value, index)}
                                        />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className='modal-footer d-flex justify-content-between'>
                    <button
                        className='btn-main'
                        onClick={() => setTmpAttrs([...tmpAttrs, { trait_type : "", value: "" }])}
                    >
                        <i className='fa fa-plus'/>Add more
                    </button>
                    <button className='btn-main' onClick={saveAttributes}>Save</button>
                </div>
            </Modal>

            <Modal
                visible={isLoading}
                width="400"
                height="300"
                effect="fadeInUp"
                onClickAway={closeModal}
            >
                <div className='position-relative w-100 h-100'>
                    <div className="trade-loader start-0 w-100 bg-white">
                        <div className="nb-spinner"></div>
                        <span className='loading-status'>{loadingStatus}</span>
                    </div>
                </div>
            </Modal>
        </>
    )
}