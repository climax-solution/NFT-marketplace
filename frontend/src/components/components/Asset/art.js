import MusicArt from "./music";
import VideoArt from "./video";
import { failedLoadImage } from "../../../utils/compre.js";
import { SRLWrapper } from "simple-react-lightbox";

const options = {
    buttons: {
        showAutoplayButton: false,
        showDownloadButton: false,
        showThumbnailsButton: false,
        showPrevButton: false,
        showNextButton: false,
    },
    thumbnails: {
        showThumbnails: false
    }
}

const Art = ({ tokenID, image, asset, redirect, type }) => {
    return (
        <>
            {
                (!type || type && (type).toLowerCase() == 'image') &&
                <>
                    {
                        redirect ? <img src={image ? image : asset} onError={failedLoadImage} className= "lazy nft__item_preview w-100 ratio-1-1" role="button" onClick={redirect} alt=""/>
                        : <SRLWrapper options={options}>
                            <img src={image ? image : asset} onError={failedLoadImage} className="lazy nft__item_preview w-100" role="button" onClick={redirect} alt=""/>
                        </SRLWrapper>
                    }
                </>
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