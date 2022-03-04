import Skeleton from "react-loading-skeleton";
import ReactPlayer from "react-player/lazy";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    .react-loading-skeleton {
        background-color: #2a2b2c !important;
        background-image: linear-gradient(90deg ,#2a2b2c,#444,#2a2b2c ) !important;
    }

    .ratio-1-1 {
        aspect-ratio: 1;
    }
`;

export default function VideoArt({ data }) {
    return (
        <>
        <GlobalStyles/>
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
        </>
    )
}