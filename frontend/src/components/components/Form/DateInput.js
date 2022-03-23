import { useEffect, useState } from "react"

export default function TextInput({ label, _request, update }) {

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

    useEffect(() => {
        if (_request) checkValue();
    },[_request])

    return (
        <div className="field-set">
            <label>{label}:</label>
            <input
                type='date'
                name='birth-date'
                className="form-control mb-0"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setStatus('');
                }}
                onBlur={checkValue}
            />
            {
                <label className='text-danger f-12px'>{status}</label>
            }
        </div>
    )
}