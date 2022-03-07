import axios from "axios";
import { useEffect, useState } from "react"
import PhoneInput from "react-phone-input-2";
import { phone } from "phone";

import 'react-phone-input-2/lib/style.css';

export default function TextInput({ label, key, _request, checkable, update }) {

    const [value, setValue] = useState('');
    const [status, setStatus] = useState("");
    
    const checkValue = async() => {
        if (!value) {
            setStatus('This field is required.');
            return;
        }

        if (checkable) {
            update("");
            
            const valid = phone(value);
            if (!valid.isValid) {
                setStatus("Phone number is invalid");
                return;
            }

            await axios.post('http://nftdevelopments.co.nz/users/check-existing-user', {key: value}).then(res => {
                setValue(value);
                update(value);
                setStatus('');
            }).catch(err => {
                const { error } = err.response.data;
                if (!error) {
                    setStatus('Already existing ' + key);
                }
                update("");
            })
        }

        else {
            setStatus("");
            update(value);
        }
    }

    useEffect(() => {
        if (_request) checkValue();
    },[_request])

    return (
        <div className="field-set">
            <label>{label}:</label>
            <PhoneInput
                country={'us'}
                inputProps={{
                    name: 'phone',
                    required: true,
                }}
                className="w-100"
                enableSearch={true}
                value={value}
                onChange={(val) => setValue("+" + val)}
                onBlur={checkValue}
            />
            {
                <label className='text-danger f-12px'>{status}</label>
            }
        </div>
    )
}