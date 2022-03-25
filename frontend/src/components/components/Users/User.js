import { useNavigate } from "react-router-dom"

export default function User({ data }) {

    const navigate = useNavigate();

    return (
        <div className="user-card mx-2">
            <div className="avatar text-center">
                <img
                    src={`${process.env.REACT_APP_BACKEND}avatar/${data.avatar}`}
                    onClick={() => navigate(`/user/${data.username}`)}
                    className="ratio-1-1"
                    crossOrigin="true"
                    role="button"
                />
            </div>
            <div className="user-name mt-5">
                <h3
                    className="text-center mb-1"
                    onClick={() => navigate(`/user/${data.username}`)}
                    role="button"
                >{data.name}</h3>
                <p
                    className="text-danger text-center"
                    onClick={() => navigate(`/user/${data.username}`)}
                    role="button"
                >@{data.username}</p>
            </div>
        </div>
    )
}