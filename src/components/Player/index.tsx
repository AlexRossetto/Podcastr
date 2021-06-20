import styles from './styles.module.scss';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {

  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying, 
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasPrevious,
    hasNext,
    isLooping,
    toggleLoop,
    isShuffling,
    toggleShuffle,
    clearPlayerState
  } = usePlayer();

  useEffect(() => {
    if(!audioRef.current) {
      return;
    }

    if(isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', event => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }
  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if(hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex]

  return(
    <div className={styles.playerContainer}>
      <header>
        <Image src="/playing.svg" alt="Tocando Agora" width={32} height={32} />
        <strong>Tocando Agora</strong>
      </header>
      
      { episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
            alt="thumbnail" 
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      ) }

      <footer className={!episode? styles.empty : ''}>
        <div className={styles.progress}>
        <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress} 
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
            <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
          </div>
          {/* IF que não tem else */}
          { episode && (
            <audio 
              src={episode.url}
              autoPlay
              ref={audioRef}
              onPlay={() => setPlayingState(true)}
              onPause={() => setPlayingState(false)}
              loop={isLooping}
              onLoadedMetadata={setupProgressListener}
              onEnded={handleEpisodeEnded}
            />
          )}
          {/* if que só executa caso else seja true
          {episode || } */}
          <div className={styles.buttons}>
            <button type="button" onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''} disabled={!episode || episodeList.length === 1}>
              <Image src="/shuffle.svg" alt="Embaralhar" height={24} width={24} />
            </button>
            <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
              <Image src="/play-previous.svg" alt="Tocar Anterior" height={24} width={24} />
            </button>
            <button type="button" className={styles.playButton} onClick={togglePlay}  disabled={!episode}>
             {isPlaying 
              ?  <Image src="/pause.svg" alt="Tocar" height={32} width={32} />
              :  <Image src="/play.svg" alt="Tocar" height={32} width={32} />}
            </button>
            <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
              <Image src="/play-next.svg" alt="Tocar Próxima" height={24} width={24} />
            </button>
            <button type="button" onClick={toggleLoop} className={isLooping ? styles.isActive : ''} disabled={!episode}>
              <Image src="/repeat.svg" alt="Repetir"  height={24} width={24}/>
            </button>
          </div>
      </footer>
    </div>
  );
}