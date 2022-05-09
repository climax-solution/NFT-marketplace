import Skeleton from "react-loading-skeleton";
import ReactPlayer from "react-player/lazy";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    .nft__item_preview video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        aspect-ratio: 1;
    }
`;

export default function VideoArt({ data }) {
    return (
        <>
            <GlobalStyles/>
            <ReactPlayer
                url={data}
                className="lazy nft__item_preview w-100 h-100 ratio-1-1"
                fallback={<Skeleton className="lazy nft__item_preview h-100 w-100 ratio-1-1"/>}
            />
        </>
    )
}