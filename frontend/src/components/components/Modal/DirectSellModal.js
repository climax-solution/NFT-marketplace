import { useState } from 'react';
import { useSelector } from 'react-redux';
import Modal from 'react-awesome-modal';
import axios from 'axios';

import { marketplace_addr } from "../../../config/address.json";
import { listSign } from '../../../utils/sign';
import { warning_toastify, success_toastify, error_toastify } from "../../../utils/notify";

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
            warning_toastify(message);
            return;
        }

        setLoading(true);
        try {
            const nftPrice = web3.utils.toWei(price.toString(), 'ether');
            const approved = await NFT.methods.getApproved(tokenID).call();
            const nonce = await Marketplace.methods.nonces(tokenID).call();
            if (approved.toLowerCase() != marketplace_addr.toLowerCase())
                await NFT.methods.approve(marketplace_addr, tokenID).send({ from: initialUser.walletAddress });
            
            const signature = await listSign(nonce, tokenID, initialUser.walletAddress, nftPrice, false);
            if (signature) {
                await axios.post(`${process.env.REACT_APP_BACKEND}sale/list`, {
                    nonce,
                    tokenID,
                    price: nftPrice,
                    walletAddress: initialUser.walletAddress,
                    action: "list",
                    signature,
                    deadline: 0
                }).then(res => {
                    success_toastify(res.data.message);
                });
                setLoading(false);
                close(true);
            }
        } catch(err) {
            let message = 'Failed';
            const parsed = JSON.parse(JSON.stringify(err));
            if (parsed.code == 4001) message = "Canceled";

            error_toastify(message);
            setLoading(false);
            close();
        }
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