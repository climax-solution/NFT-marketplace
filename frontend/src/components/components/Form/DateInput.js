import { useState } from "react"


export default function TextInput({ label, update }) {

    const [value, setValue] = useState('');
    const [status, setStatus] = useState("");
    
    const checkValue = async() => {
        if (!value) {
            setStatus('This field is required.');
            update('');
            return;
        }

        else {
            update(value);
            setStatus('');
        }
    }

    return (
        <div className="col-md-6">
            <div className="field-set">
                <label>{label}:</label>
                <input type='date' name='birth-date' id='birth-date' className="form-control mb-0" value={value} onChange={(e) => setValue(e.target.value) } onBlur={checkValue}/>
                {
                    <label className='text-danger'>{status}</label>
                }
            </div>
        </div>
    )
}