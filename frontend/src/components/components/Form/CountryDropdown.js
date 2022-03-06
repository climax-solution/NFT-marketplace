import { useState } from "react";
import CountryDropdown from 'country-dropdown-with-flags-for-react';

export default function CountryList({ update }) {

    const [value, setValue] = useState("New Zealand");
    const [status, setStatus] = useState('');

    const checkValue = () => {
        if (value) {
            setStatus('');
            update(value);
        }
        else {
            setStatus('This field is required');
            update('');
        }
    }

    return (
        <div className="col-md-6">
            <div className="field-set">
                <label>Country:</label>
                <CountryDropdown
                    id="country-list"
                    className="form-control mb-0"
                    preferredCountries={['nz']}
                    value={value}
                    handleChange={e => {
                        setValue(e.target.value);
                        update(e.target.value);
                    }}

                    isValid={(inputNumber, country, countries) => {
                            return countries.some((country) => {
                            return inputNumber;
                        });
                    }}

                    
                />
                {
                    <label className='text-danger f-12px'>{status}</label>
                }
            </div>
        </div>
    )
}