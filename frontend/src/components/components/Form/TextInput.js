import axios from "axios";
import { useState } from "react"

export default function TextInput({ label, key, checkable, update }) {

    const [value, setValue] = useState('');
    const [status, setStatus] = useState("");
    
    const checkValue = async() => {
        if (!value) {
            setStatus('This field is required.');
            return;
        }

        if (checkable) {
            await axios.post('http://nftdevelopments.co.nz/users/check-existing-user', {key: arg}).then(res => {
                update(value);
            }).catch(err => {
                const { error } = err.response.data;
                if (!error) {
                    setStatus('Already existing ' + key);
                }
                update("");
            })
        }
    }

    return (
        <div className="col-md-6">
            <div className="field-set">
                <label>{label}:</label>
                <input type='text' name='first-name' id='first-name' className="form-control mb-0" value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => checkValue()}/>
                {
                    <span className='text-danger'>{status}</span>
                }
            </div>
        </div>
    )
}