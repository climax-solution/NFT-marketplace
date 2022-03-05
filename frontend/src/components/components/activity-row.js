import moment from "moment";
import { createGlobalStyle } from "styled-components";

const action = [
    ["action-buy","Buy"],
    ["action-sell","Put On Sale"],
    ["action-down-sell","Removed On Sale"],
    ["action-to-premium","Covert To Premium NFT"],
    ["action-to-normal","Covert To Normal NFT"],
    ["action-on-auction","Put On Auction"],
    ["action-down-auction","Removed On Auction"],
    ["action-make-bid","Make Offer"],
    ["action-withdraw-bid","Withdraw Offer"],
    ["action-like","Make Liking NFT"],
    ["action-dislike","Cancel Liking NFT"],
    ["action-claim","Claim NFT"],
    ["action-follow","Follow"],
    ["action-disfollow","Disfollow"]
];

const GlobalStyles = createGlobalStyle`
    .ratio-1-1 {
        aspect-ratio: 1;
    }
`;

const ActivityItem = ({ data }) => {
    return (
        <>
            <GlobalStyles/>
            <li className={action[data["type"]][0]}>
                <div className="d-flex align-items-center">
                    <img className="lazy ratio-1-1 position-relative" src={`http://nftdevelopments.co.nz/avatar/${data.avatar}`} alt="" crossOrigin="true"/>
                    <h4 className="ms-2">{data.firstName + " " + data.lastName }</h4>
                </div>
                <div className="act_list_text ps-0 mt-2 text-break">
                    <h4>{action[data["type"]][1]}</h4>
                    1 edition purchased by <span className='color'>{data.walletAddress}</span>
                    <span className="act_list_date">
                        {moment(data.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                    </span>
                </div>
            </li>
        </>
    )
}

export default ActivityItem;