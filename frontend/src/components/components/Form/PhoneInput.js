import axios from "axios";
import { useState } from "react"
import PhoneInput from "react-phone-input-2";

export default function TextInput({ label, key, checkable, update }) {

    const [value, setValue] = useState('');
    const [status, setStatus] = useState("");
    
    const checkValue = async(arg) => {
        if (!arg) {
            setStatus('This field is required.');
            return;
        }

        if (checkable) {
            await axios.post('http://nftdevelopments.co.nz/users/check-existing-user', {key: arg}).then(res => {
                setValue(arg);
                update(arg);
            }).catch(err => {
                const { error } = err.response.data;
                if (!error) {
                    setStatus('Already existing ' + key);
                }
                update(arg);
            })
        }
    }

    return (
        <div className="col-md-6">
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
                    <span className='text-danger'>{status}</span>
                }
            </div>
        </div>
    )
}