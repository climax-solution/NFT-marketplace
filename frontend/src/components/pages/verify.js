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
        <div>
            {
                isLoading ? (
                    <div className='d-flex w-100 h-100 justify-content-center align-items-center'>
                        <div className='reverse-spinner'></div>
                        <span className="">Verifying....</span>
                    </div>
                ) : (
                    <div>
                        <h1 className={verified ? "text-success" : "text-danger"}>{status}</h1>
                        {
                            verified ? <Link to="/login">Please Login</Link> : ""
                        }
                    </div>
                )
            }
        </div>
    );
}