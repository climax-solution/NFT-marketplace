import Skeleton from "react-loading-skeleton";
import ReactPlayer from "react-player/lazy";

export default function VideoArt({ data }) {
    return (
        <ReactPlayer
            url={data}
            config={{
                youtube: {
                    playerVars: {
                        origin: 'https://www.youtube.com'
                    }
                }
            }}
            className="lazy nft__item_preview w-100 h-100 ratio-1-1"
            fallback={<Skeleton className="lazy nft__item_preview h-100 w-100 ratio-1-1"/>}
        />
    )
}