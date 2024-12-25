import { useState, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudioId(null);
    }
  }, []);

  const playAudio = useCallback((audioUrl: string, id: number) => {
    if (currentAudioId === id && isPlaying) {
      stopCurrentAudio();
      return;
    }

    if (currentAudioId !== id) {
      stopCurrentAudio();
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
    });

    setIsPlaying(true);
    setCurrentAudioId(id);

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentAudioId(null);
    };
  }, [currentAudioId, isPlaying, stopCurrentAudio]);

  return {
    isPlaying,
    currentAudioId,
    playAudio,
    stopAudio: stopCurrentAudio
  };
}