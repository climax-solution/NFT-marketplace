import { useEffect, useState } from "react";

const MusicNFT = ({ data }) => {

    const [isPlay, setPlay] = useState(false);

    const playMusic = () => {
        setPlay(!isPlay);
        if (!isPlay) document.getElementsByClassName(`track-${data.nftData.tokenID}`)[0].play();
        else document.getElementsByClassName(`track-${data.nftData.tokenID}`)[0].pause();
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
            <a href="02_dark-item-details-audio.html" className="w-100">
                <img src={data.image} className="lazy nft__item_preview" alt=""/>
            </a>
        </>
    )
}

export default MusicNFT;