import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MusicArt({ tokenID, image, asset, redirect }) {

    const [isPlay, setPlay] = useState(false);
    const navigate = useNavigate();

    const playMusic = () => {
        setPlay(!isPlay);
        if (!isPlay) document.getElementsByClassName(`track-${tokenID}`)[0].play();
        else document.getElementsByClassName(`track-${tokenID}`)[0].pause();
    }
    
    const failedLoadImage = (e) => {
        e.target.src = "/img/background/2.jpg";
    }

    return (
        <div className="d-flex align-items-center position-relative">
            <div className="nft_type_wrap">
                <audio className={`track-${tokenID}`} src={asset} type="audio/mpeg"/>

                <div className="player-container">
                    <div className={`play-pause ${isPlay ? 'pause' : 'play'}`} onClick={playMusic}/>
                </div>
                
                <div className={`circle-ripple ${isPlay ? 'd-block' : 'd-none'}`}/>
            </div>
            <span onClick={redirect} className="w-100 ratio-1-1 text-center" role="button">
                <img src={image} onError={failedLoadImage} className="lazy nft__item_preview w-100 ratio-1-1" alt=""/>
            </span>
        </div>
    )
}