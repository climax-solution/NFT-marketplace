import axios from "axios";
import { useEffect, useState } from "react"
import validator from "validator";

export default function TextInput({ label, _request,  _key, checkable, update }) {

    const [value, setValue] = useState('');
    const [status, setStatus] = useState("");
    const [checking, setChecking] = useState(false);

    const checkValue = async() => {
        if (!value) {
            setStatus('This field is required.');
            update("");
            return;
        }

        if (checkable) {
            let data = {};
            data[_key] = value;

            update("");
            setChecking(true);
            if (_key === 'email') {
                if (!validator.isEmail(value)) {
                    setStatus("This field is email required");
                    setChecking(false);
                    return;
                }
            }

            if (_key === 'walletAddress') {
                if (!validator.isEthereumAddress(value)) {
                    setStatus("This field is Binance Smart Chain wallet address required");
                    setChecking(false);
                    return;
                }
            }
            
            await axios.post('http://nftdevelopments.co.nz/user/check-existing-user', data).then(res => {
                update(value);
                setStatus("");
            }).catch(err => {
                const { error } = err.response.data;
                if (!error) {
                    setStatus('Already existing ' + _key);
                }
                update("");
            });

            setChecking(false);
        }

        else {
            setStatus('');
            update(value);
        }
    }

    useEffect(async() => {
        if (_request) await checkValue();
    },[_request])

    return (
        <div className="field-set">
            <label>{label}:</label>
            <input
                type={ _key === 'email' ? 'email' : 'text'}
                name={label}
                className="form-control mb-0"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setStatus("");
                }}
                onBlur={() => checkValue()}
                readOnly={checking}
            />
            {
                <label className='text-danger f-12px'>{status}</label>
            }
        </div>
    )
}