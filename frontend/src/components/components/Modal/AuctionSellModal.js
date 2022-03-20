import axios from 'axios';
import { useState } from 'react';
import Modal from 'react-awesome-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import addresses from "../../../config/address.json";
import { auctionSign } from '../../../utils/sign';
const { marketplace_addr } = addresses;

const days = [...Array(8).keys()];
const hours = [...Array(24).keys()];

export default function AuctionSellModal({ visible, close, tokenID, web3, NFT, Marketplace }) {

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [price, setPrice] = useState('');
    const [day, setDay] = useState(0);
    const [hour, setHour] = useState(0);
    const [isLoading, setLoading] = useState(false);
    
    const listOnAuction = async () => {
        
        let message = '';
        if (!wallet_info) message = 'Please connect metamask';
        else if (price <= 0) message = 'Please reserve correct price';
        else if (!day && !hour) message = 'Please choose duration';

        if (message) {
            toast.warning(message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            return;
        }
        setLoading(true);
        try {
            const nftPrice = web3.utils.toWei(price.toString(), 'ether');
            
            const nonce = await Marketplace.methods.nonces(initialUser.walletAddress).call();
            const signature = await auctionSign(nonce, tokenID, initialUser.walletAddress, nftPrice, false);
            
            if (signature) {
                await axios.post(`${process.env.REACT_APP_BACKEND}sale/list`, {
                    tokenID, price: nftPrice, walletAddress: initialUser.walletAddress, action: "auction",
                    signature, deadline: (day * 24 + hour * 1)
                });
                close(true);
            }
            
        } catch(err) {
            toast.error(err.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
            });
            close();
        }
        setLoading(false);
    }

    const _closeModal = () => {
        setPrice('');
        setDay(0);
        setHour(0);
        close();
    }
    
    return (
        <Modal
            visible={visible}
            width="400"
            height="300"
            effect="fadeInUp"
            onClickAway={null}
        >
            {
                
                isLoading ?
                    <div className='d-flex w-100 h-100 justify-content-center align-items-center'>
                        <div className='reverse-spinner'></div>
                    </div>
                :
                <div className='p-5'>
                    <div className='form-group'>
                        <label>Please reserve price.</label>
                        <input
                            type="number"
                            className='form-control text-dark border-dark'
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className='duration-group'>
                        <label>Please choose auction duration.</label>
                        <div className='groups w-100'>
                            <div className='form-group'>
                                <span>Days</span>
                                <select
                                    className='form-control text-dark border-dark'
                                    value={day}
                                    onChange={
                                        (e) => {
                                            if (e.target.value == 7) setHour(0);
                                            setDay(e.target.value);
                                        }
                                    }
                                >
                                    {
                                        days.map((item, index) => {
                                            return <option value={index} key={index}>{index}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className='form-group'>
                                <span>Hours</span>
                                <select
                                    className='form-control text-dark border-dark'
                                    value={hour}
                                    onChange={(e) => day == 7 ? null : setHour(e.target.value)}
                                    disabled={day == 7 ? true : false }
                                >
                                    {
                                        hours.map((item, index) => {
                                            return <option value={index} key={index}>{index}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='groups'>
                        <button
                            className='btn-main btn-apply w-100'
                            onClick={listOnAuction}
                        >Apply</button>
                        <button
                            className='btn-main w-100'
                            onClick={_closeModal}
                        >Cancel</button>
                    </div>
                </div>
            }
        </Modal>
    )
}