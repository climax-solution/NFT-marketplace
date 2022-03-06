import { useEffect, useState } from "react"

export default function TextInput({ label, _request, _equal, update }) {

    const [value, setValue] = useState('');
    const [status, setStatus] = useState("");
    
    const checkValue = async() => {
        if (!value) {
            setStatus('This field is required.');
            update("");
            return;
        }

        update(value);
    }

    useEffect(() => {
        if (_request) checkValue();
    },[_request])

    useEffect(() => {
        if (_request) {
            if (!_equal) setStatus('Please confirm password');
            else checkValue();
        }
    },[_equal])

    return (
        <div className="col-md-6">
            <div className="field-set">
                <label>{label}:</label>
                <input
                    type='password'
                    name={label}
                    className="form-control mb-0"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setStatus("");
                    }}
                    onBlur={() => checkValue()}
                />
                {
                    <label className='text-danger f-12px'>{status}</label>
                }
            </div>
        </div>
    )
}