import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Modal from 'react-awesome-modal';
import axios from 'axios';

import { marketplace_addr } from "../../../config/address.json";
import { listSign } from '../../../utils/sign';

export default function DirectSellModal({ visible, tokenID, close, NFT, Marketplace, web3 }) {

    const initialUser = useSelector(({ auth }) => auth.user);
    const wallet_info = useSelector(({ wallet }) => wallet.wallet_connected);

    const [price, setPrice] = useState('');
    const [isLoading, setLoading] = useState(false);

    const listOnSale = async () => {
        
        let message = "";
        if (!wallet_info) {
            message = "Please connect metamask";
        }

        else if (price <= 0) {
            message = "Please reserve correct price.";
        }

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

        setLoading(true);
        try {
            const nftPrice = web3.utils.toWei(price.toString(), 'ether');
            const approved = await NFT.methods.getApproved(tokenID).call();
            const nonce = await Marketplace.methods.nonces(initialUser.walletAddress).call();
            if (approved.toLowerCase() != marketplace_addr.toLowerCase())
                await NFT.methods.approve(marketplace_addr, tokenID).send({ from: initialUser.walletAddress });
            
            const signature = await listSign(nonce, tokenID, initialUser.walletAddress, nftPrice, false);
            if (signature) {
                await axios.post(`${process.env.REACT_APP_BACKEND}sale/list`, {
                    tokenID, price: nftPrice, walletAddress: initialUser.walletAddress, action: "list",
                    signature, deadline: 0
                }).then(res => {
                    toast.success(res.data.message, {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored"
                    });
                });
                close(true);
            }
        } catch(err) {
            toast.error(err.message, {
                position: "top-center",
                autoClose: 2000,
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
        close();
    }

    return (
        <Modal
            visible={visible}
            width="300"
            height="200"
            effect="fadeInUp"
            onClickAway={null}
        >
            {
                isLoading ?
                <div className='d-flex w-100 h-100 justify-content-center align-items-center'>
                    <div className='reverse-spinner'></div>
                </div>
                : <div className='p-5'>
                        <div className='form-group'>
                            <label>Please reserve price.</label>
                            <input
                                type="number"
                                className='form-control text-dark border-dark'
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className='groups'>
                            <button
                                className='btn-main btn-apply w-100'
                                onClick={listOnSale}
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