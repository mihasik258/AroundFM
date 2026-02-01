import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

const AUTO_SWITCH_INTERVAL = 10 * 60 * 1000; // 10 минут
const CONNECTION_TIMEOUT = 15000; // 15 секунд на подключение

// Черный список нерабочих станций
const blacklistedUrls = new Set<string>();

// Глобальное состояние для синхронизации
let audioElement: HTMLAudioElement | null = null;
let audioInitialized = false;
let connectionTimer: number | null = null;
let connected = false;

export function useAudioPlayer() {
    const currentUrlRef = useRef<string | null>(null);
    const [, forceUpdate] = useState(0);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const store = useStore();
    const { currentStation, isPlaying, setIsPlaying, nextStation, autoSwitchTimer, setAutoSwitchTimer } = store;

    // Очистка таймера подключения
    const clearTimer = useCallback(() => {
        if (connectionTimer) {
            window.clearTimeout(connectionTimer);
            connectionTimer = null;
        }
    }, []);

    // Инициализация Audio один раз
    useEffect(() => {
        if (audioInitialized) return;
        audioInitialized = true;

        audioElement = new Audio();
        audioElement.preload = 'auto';

        // Успешное воспроизведение
        audioElement.addEventListener('playing', () => {
            console.log('✅ Playing!');
            clearTimer();
            connected = true;
            setIsConnecting(false);
            setIsLoading(false);
            setError(null);
            setIsPlaying(true);
            forceUpdate(n => n + 1);
        });

        // Ошибка загрузки
        audioElement.addEventListener('error', (e) => {
            console.error('❌ Error:', e);
            clearTimer();
            connected = false;

            if (currentUrlRef.current) {
                blacklistedUrls.add(currentUrlRef.current);
                console.log('Blacklisted:', currentUrlRef.current);
            }

            setIsConnecting(false);
            setIsLoading(false);
            setError('Ошибка загрузки');

            setTimeout(() => nextStation(), 500);
        });

        // Буферизация
        audioElement.addEventListener('waiting', () => {
            setIsLoading(true);
        });

        // Готов к воспроизведению
        audioElement.addEventListener('canplay', () => {
            console.log('🎵 Ready');
            setIsLoading(false);
        });

        return () => {
            // Не очищаем при unmount
        };
    }, []);

    // Загрузка станции при изменении currentStation
    useEffect(() => {
        if (!currentStation || !audioElement) return;

        // Пропуск если URL тот же
        if (currentUrlRef.current === currentStation.url && connected) {
            return;
        }

        // Проверка черного списка
        if (blacklistedUrls.has(currentStation.url)) {
            console.log('⏭️ Skip blacklisted:', currentStation.name);
            setTimeout(() => nextStation(), 100);
            return;
        }

        console.log('🔄 Loading:', currentStation.name);

        // Сброс состояния
        connected = false;
        currentUrlRef.current = currentStation.url;
        setIsConnecting(true);
        setIsLoading(true);
        setError(null);
        clearTimer();

        // Остановка текущего потока
        audioElement.pause();
        audioElement.src = currentStation.url;

        // Таймаут подключения
        connectionTimer = window.setTimeout(() => {
            if (!connected) {
                console.warn('⏰ Timeout:', currentStation.name);
                blacklistedUrls.add(currentStation.url);
                setIsConnecting(false);
                setError('Таймаут');
                nextStation();
            }
        }, CONNECTION_TIMEOUT);

        // Начало воспроизведения
        audioElement.play().catch(err => {
            console.error('Play failed:', err);
        });

    }, [currentStation?.url]);

    // Управление воспроизведением
    useEffect(() => {
        if (!audioElement) return;

        if (isPlaying && connected) {
            if (audioElement.paused) {
                audioElement.play().catch(console.error);
            }
        } else if (!isPlaying) {
            audioElement.pause();
        }
    }, [isPlaying]);

    // Автосмена каждые 10 минут
    useEffect(() => {
        if (isPlaying && currentStation && connected) {
            if (autoSwitchTimer) {
                clearTimeout(autoSwitchTimer);
            }

            const timer = window.setTimeout(() => {
                console.log('⏰ Auto-switch');
                nextStation();
            }, AUTO_SWITCH_INTERVAL);

            setAutoSwitchTimer(timer);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, currentStation, connected]);

    // Кнопка Play
    const play = useCallback(() => {
        if (audioElement && connected) {
            audioElement.play().catch(console.error);
            setIsPlaying(true);
        }
    }, [setIsPlaying]);

    // Кнопка Pause
    const pause = useCallback(() => {
        if (audioElement) {
            audioElement.pause();
            setIsPlaying(false);
        }
    }, [setIsPlaying]);

    // Кнопка Skip
    const skip = useCallback(() => {
        console.log('⏭️ Skip clicked');
        clearTimer();
        connected = false;
        currentUrlRef.current = null;
        if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
        }
        nextStation();
    }, [nextStation, clearTimer]);

    return {
        play,
        pause,
        skip,
        isPlaying: isPlaying && connected,
        isLoading,
        isConnecting,
        error,
        blacklistedCount: blacklistedUrls.size,
        isConnected: connected,
    };
}
