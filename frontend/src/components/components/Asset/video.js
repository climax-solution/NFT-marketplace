import { Player } from 'video-react';
import 'video-react/dist/video-react.css';

export default function VideoArt({ data }) {
    return (
        <Player className="lazy nft__item_preview w-100 h-100 ratio-1-1 pt-0">
            <source src={data}/>
        </Player>
    )
}