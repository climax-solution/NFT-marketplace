import MusicArt from "./music";
import VideoArt from "./video";
import { failedLoadImage } from "../../../utils/compre.js";

const Art = ({ tokenID, image, asset, redirect, type }) => {

    return (
        <>
            {
                (!type || type && (type).toLowerCase() == 'image') && <img src={image ? image : asset} onError={failedLoadImage} className="lazy nft__item_preview ratio-1-1 w-100" role="button" onClick={redirect} alt=""/>
            }

            {
                (type && (type).toLowerCase() == 'music') && <MusicArt tokenID={tokenID} image={image} asset={asset} redirect={redirect}/>
            }

            {
                (type && (type).toLowerCase() == 'video') && <VideoArt data={asset}/>
            }
        </>
    )
}

export default Art;