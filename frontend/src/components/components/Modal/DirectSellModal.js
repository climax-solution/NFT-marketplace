import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Modal from 'react-awesome-modal';
import axios from 'axios';

import addresses from "../../../config/address.json";
import sign from '../../../utils/sign';
const { marketplace_addr } = addresses;

export default function DirectSellModal({ visible, tokenID, close, Marketplace, web3 }) {

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
            const nonce = await Marketplace.methods.nonces(initialUser.walletAddress).call();
            const result = await sign(nonce, tokenID, initialUser.walletAddress, nftPrice, false);
            if (result) {
                await axios.post('http://localhost:7060/sale/list', {
                    tokenID, price: nftPrice, walletAddress: initialUser.walletAddress, action: "list",
                    signature: result
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