import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function VerifyAccount() {
    const { token, email, username } = useParams();
    const [isLoading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(async() => {
        const verifyData = {
            token, 
            email,
            username
        };

        await axios.post(`${process.env.REACT_APP_BACKEND}auth/verify`, verifyData).then(res => {
            setVerified(true);
            const { message } = res.data;
            setStatus(message);
        }).catch(err => {
            const { error } = err.response.data;
            setStatus(error);
            setVerified(false);
        });
        setLoading(false);
    }, [])

    return (
        <div className="verify-panel">
            {
                isLoading ? (
                    <div className='d-flex w-100 h-100 flex-column justify-content-center align-items-center'>
                        <div className='reverse-spinner'></div>
                        <span className="mt-4">Verifying....</span>
                    </div>
                ) : (
                    <div className="text-center">
                        <h1 className={verified ? "text-success" : "text-danger"}>{status}</h1>
                        {
                            verified
                            ? <Link to="/login" className="text-decoration-none text-success">PLEASE LOGIN <i className="fa fa-arrow-right"/></Link>
                            : <Link to="/" className="text-decoration-none text-danger"><i className="fa fa-arrow-left"/> RETURN</Link>
                        }
                    </div>
                )
            }
        </div>
    );
}