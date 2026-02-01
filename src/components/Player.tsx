import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { fetchStations } from '../services/api';
import { Globe } from './Globe';
import { Controls } from './Controls';
import './Player.css';

// Флаги языков
const LANGUAGE_FLAGS: Record<string, string> = {
    'english': '🇬🇧',
    'german': '🇩🇪',
    'french': '🇫🇷',
    'spanish': '🇪🇸',
    'italian': '🇮🇹',
    'portuguese': '🇵🇹',
    'russian': '🇷🇺',
    'japanese': '🇯🇵',
    'chinese': '🇨🇳',
    'korean': '🇰🇷',
    'dutch': '🇳🇱',
    'polish': '🇵🇱',
    'swedish': '🇸🇪',
    'norwegian': '🇳🇴',
    'finnish': '🇫🇮',
    'danish': '🇩🇰',
    'greek': '🇬🇷',
    'turkish': '🇹🇷',
    'arabic': '🇸🇦',
    'hindi': '🇮🇳',
    'czech': '🇨🇿',
    'hungarian': '🇭🇺',
    'romanian': '🇷🇴',
    'ukrainian': '🇺🇦',
};

function getLanguageFlag(language: string): string {
    const lang = language.toLowerCase();
    return LANGUAGE_FLAGS[lang] || '🌐';
}

export function Player() {
    const {
        currentStation,
        selectedGenre,
        excludedLanguages,
        setCurrentStation,
        setStationQueue,
        setCurrentScreen,
    } = useStore();

    const { isConnecting, isConnected, error: playerError } = useAudioPlayer();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка станций при первом рендере
    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const stations = await fetchStations(selectedGenre, excludedLanguages, 50);

            if (stations.length === 0) {
                setError('Не найдено станций с выбранными фильтрами');
                return;
            }

            // Устанавливаем первую станцию как текущую
            setCurrentStation(stations[0]);
            // Остальные в очередь
            setStationQueue(stations.slice(1));
        } catch (err) {
            console.error('Error loading stations:', err);
            setError('Не удалось загрузить станции');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentScreen('genre');
    };

    if (isLoading) {
        return (
            <div className="player loading">
                <div className="spinner-large"></div>
                <p>Загрузка станций...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="player error">
                <p className="error-message">{error}</p>
                <button className="btn-primary" onClick={loadStations}>
                    Попробовать снова
                </button>
                <button className="btn-secondary" onClick={handleBack}>
                    Изменить фильтры
                </button>
            </div>
        );
    }

    // Определяем статус и цвет индикатора
    const getStatusInfo = () => {
        if (isConnected) {
            return { text: 'Now Playing', color: '#4CAF50', animation: 'none' };
        }
        if (playerError) {
            return { text: 'Переключение...', color: '#ff6b6b', animation: 'pulse' };
        }
        if (isConnecting) {
            return { text: 'Подключение...', color: '#ffa500', animation: 'pulse' };
        }
        return { text: 'Ожидание...', color: '#888', animation: 'none' };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="player">
            <header className="player-header">
                <h1 className="app-title">
                    Around FM
                    <button className="settings-btn" onClick={handleBack} title="Настройки">
                        ⚙️
                    </button>
                </h1>
            </header>

            <div className="now-playing">
                <span
                    className={`status-indicator ${statusInfo.animation}`}
                    style={{ color: statusInfo.color }}
                >
                    ●
                </span>
                <span className="status-text">{statusInfo.text}</span>
            </div>

            <h2 className="station-name">
                {isConnecting ? (
                    <span className="connecting-text">
                        {currentStation?.name || 'Загрузка...'}
                        <span className="connecting-dots">...</span>
                    </span>
                ) : (
                    currentStation?.name || 'Загрузка...'
                )}
            </h2>

            <div className="globe-container">
                <Globe />
            </div>

            <div className="station-info">
                <div className="station-details">
                    <span className="country-info">
                        <span className="country-pin">📍</span>
                        <span className="country-name">{currentStation?.country || 'Unknown'}</span>
                    </span>
                    {currentStation?.language && (
                        <span className="language-flag">{getLanguageFlag(currentStation.language)}</span>
                    )}
                </div>
                {selectedGenre && (
                    <div className="genre-badge">
                        🎵 {selectedGenre}
                    </div>
                )}
            </div>

            <Controls />
        </div>
    );
}
