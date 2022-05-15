import moment from "moment";
import { useNavigate } from "react-router-dom";
import { failedLoadImage } from "../../../utils/compre.js";

const action = [
    ["action-buy","Buy"],
    ["action-sell","Listed"],
    ["action-down-sell","Listing Removed"],
    ["action-to-premium","Upgrade to a premium listing"],
    ["action-to-normal","Downgrade to a normal listing."],
    ["action-on-auction","List as an auction"],
    ["action-down-auction","Remove  Auction listing"],
    ["action-make-bid","Make an offer"],
    ["action-withdraw-bid","Withdraw offer"],
    ["action-like","Like NFT"],
    ["action-dislike","Dislike NFT"],
    ["action-claim","Claim NFT"],
    ["action-follow","Follow"],
    ["action-disfollow","Unfollow"]
];

const ActivityItem = ({ data }) => {

    const navigate = useNavigate();

    return (
        <li className={action[data["type"]][0]} onClick={() => data.username ? navigate(`/user/${data.username}`) : null} role="button">
            <div className="d-flex align-items-center">
                <img className="lazy ratio-1-1 position-relative" src={`${process.env.REACT_APP_BACKEND}avatar/${data?.avatar}`} onError={failedLoadImage} alt="" crossOrigin="true"/>
                <h4 className="ms-2">{data.name }</h4>
            </div>
            <div className="act_list_text ps-0 mt-2 text-break">
                <h4>{action[data["type"]][1]}</h4>
                1 edition purchased by <span className='color'>{data.walletAddress}</span>
                <span className="act_list_date">
                    {moment(data.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                </span>
            </div>
        </li>
    )
}

export default ActivityItem;