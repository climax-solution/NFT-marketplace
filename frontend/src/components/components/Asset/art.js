import MusicArt from "./music";
import VideoArt from "./video";

const Art = ({ tokenID, image, asset, redirect, type }) => {


    const failedLoadImage = (e) => {
        e.target.src="/img/empty.jfif";
    }

    return (
        <>
            {
                (!type || type && (type).toLowerCase() == 'image') && <img src={image ? image : asset} onError={failedLoadImage} className="lazy nft__item_preview ratio-1-1" role="button" onClick={redirect} alt=""/>
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