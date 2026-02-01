import { useStore } from '../store/useStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { addFavorite, removeFavorite } from '../services/api';
import './Controls.css';

export function Controls() {
    const {
        currentStation,
        telegramId,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
    } = useStore();

    const { isPlaying, isConnecting, isConnected, play, pause, skip } = useAudioPlayer();

    const handleFavoriteToggle = async () => {
        if (!currentStation || !telegramId) return;

        const favorite = isFavorite(currentStation.url);

        try {
            if (favorite) {
                await removeFavorite(telegramId, currentStation.url);
                removeFromFavorites(currentStation.url);
            } else {
                await addFavorite(telegramId, currentStation);
                addToFavorites(currentStation);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    // Кнопки активны когда есть станция, даже если ещё подключается
    const canInteract = !!currentStation;

    return (
        <div className="controls">
            <button
                className={`control-btn favorite-btn ${currentStation && isFavorite(currentStation.url) ? 'active' : ''}`}
                onClick={handleFavoriteToggle}
                disabled={!currentStation}
                title="Добавить в избранное"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="currentColor"
                    />
                </svg>
            </button>

            <button
                className={`control-btn play-pause-btn ${isConnecting && !isConnected ? 'connecting' : ''}`}
                onClick={handlePlayPause}
                disabled={!canInteract}
                title={isPlaying ? 'Пауза' : 'Воспроизвести'}
            >
                {isConnecting && !isConnected ? (
                    <div className="spinner"></div>
                ) : isPlaying ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor" />
                    </svg>
                ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                )}
            </button>

            <button
                className="control-btn next-btn"
                onClick={skip}
                disabled={!canInteract}
                title="Следующая станция"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4l12 8-12 8V4zm13 0v16h2V4h-2z" fill="currentColor" />
                </svg>
            </button>

            <button
                className="control-btn stop-btn"
                onClick={pause}
                disabled={!isConnected}
                title="Стоп"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6h12v12H6z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
}
