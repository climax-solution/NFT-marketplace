import { useNavigate } from "react-router-dom";
import { failedLoadImage } from "../../../utils/compre.js";

export default function Buyer ({ user, web3 }) {
    const navigate = useNavigate();
    
    return (
        <li onClick={() => navigate(`/user/${user.username}`)}>
            <div className="author_list_pp">
                <span>
                    <img className="lazy ratio-1-1" src={`${process.env.REACT_APP_BACKEND}avatar/${user?.avatar}`} alt="" onError={failedLoadImage} crossOrigin='true'/>
                    <i className="fa fa-check"></i>
                </span>
            </div>                                    
            <div className="author_list_info">
                <span>{user.name}</span><br/>
                <span className="bot d-inline-block">{web3.utils.fromWei((user.price).toString(), "ether")} BNB</span>
            </div>
        </li>
    )
}