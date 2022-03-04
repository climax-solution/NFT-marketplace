import { useState } from "react";

export default function MusicArt({ data, link }) {

    const [isPlay, setPlay] = useState(false);

    const playMusic = () => {
        setPlay(!isPlay);
        if (!isPlay) document.getElementsByClassName(`track-${data.nftData.tokenID}`)[0].play();
        else document.getElementsByClassName(`track-${data.nftData.tokenID}`)[0].pause();
    }
    
    const failedLoadImage = (e) => {
        e.target.src = "/img/background/2.jpg";
    }

    return (
        <>
            <div className="nft_type_wrap">
                <audio className={`track-${data.nftData.tokenID}`} src={data.asset} type="audio/mpeg"/>

                <div className="player-container">
                    <div className={`play-pause ${isPlay ? 'pause' : 'play'}`} onClick={playMusic}/>
                </div>
                
                <div className={`circle-ripple ${isPlay ? 'd-block' : 'd-none'}`}/>
            </div>
            <a href={link} className="w-100">
                <img src={data.image} onError={failedLoadImage} className="lazy nft__item_preview" alt=""/>
            </a>
        </>
    )
}