import ReactPlayer from "react-player";

export default function VideoArt({ link }) {
    return (
        <ReactPlayer
            url={link}
            config={{
                youtube: {
                    playerVars: {
                        origin: 'https://www.youtube.com'
                    }
                }
            }}
            className="lazy nft__item_preview w-100"
        />
    )
}