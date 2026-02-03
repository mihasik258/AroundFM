import { create } from 'zustand';

export interface RadioStation {
    name: string;
    url: string;
    homepage: string;
    favicon: string;
    tags: string[];
    country: string;
    language: string;
    codec: string;
    bitrate: number;
    stationuuid?: string;
}

interface AppState {
    // Пользователь
    telegramId: number | null;
    setTelegramId: (id: number) => void;

    // Настройки фильтров
    selectedGenres: string[];
    toggleGenre: (genre: string) => void;
    // Настройки языков (пустой список = все языки доступны)
    allowedLanguages: string[];
    setAllowedLanguages: (languages: string[]) => void;

    // Станции
    currentStation: RadioStation | null;
    stationQueue: RadioStation[];
    setCurrentStation: (station: RadioStation | null) => void;
    setStationQueue: (stations: RadioStation[]) => void;
    nextStation: () => void;

    // Плеер
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;

    // Избранное
    favorites: RadioStation[];
    setFavorites: (favorites: RadioStation[]) => void;
    addToFavorites: (station: RadioStation) => void;
    removeFromFavorites: (stationUrl: string) => void;
    isFavorite: (stationUrl: string) => boolean;

    // Навигация
    currentScreen: 'genre' | 'language' | 'player';
    setCurrentScreen: (screen: 'genre' | 'language' | 'player') => void;

    // Таймер автосмены
    autoSwitchTimer: number | null;
    setAutoSwitchTimer: (timer: number | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
    // Пользователь
    telegramId: null,
    setTelegramId: (id) => set({ telegramId: id }),

    // Настройки фильтров
    // Настройки фильтров
    // Настройки фильтров
    selectedGenres: ['any'],
    toggleGenre: (genre) => set((state) => {
        if (genre === 'any') {
            return { selectedGenres: ['any'] };
        }

        let newGenres = state.selectedGenres.filter((g) => g !== 'any');
        if (newGenres.includes(genre)) {
            newGenres = newGenres.filter((g) => g !== genre);
        } else {
            newGenres = [...newGenres, genre];
        }

        if (newGenres.length === 0) {
            newGenres = ['any'];
        }

        return { selectedGenres: newGenres };
    }),
    allowedLanguages: [],
    setAllowedLanguages: (languages) => set({ allowedLanguages: languages }),

    // Станции
    currentStation: null,
    stationQueue: [],
    setCurrentStation: (station) => set({ currentStation: station }),
    setStationQueue: (stations) => set({ stationQueue: stations }),
    nextStation: () => {
        const { stationQueue, setCurrentStation } = get();
        if (stationQueue.length > 0) {
            const [nextStation, ...rest] = stationQueue;
            setCurrentStation(nextStation);
            set({ stationQueue: rest });
        }
    },

    // Плеер
    isPlaying: false,
    setIsPlaying: (playing) => set({ isPlaying: playing }),

    // Избранное
    favorites: [],
    setFavorites: (favorites) => set({ favorites }),
    addToFavorites: (station) => {
        const { favorites } = get();
        if (!favorites.find((f) => f.url === station.url)) {
            set({ favorites: [...favorites, station] });
        }
    },
    removeFromFavorites: (stationUrl) => {
        const { favorites } = get();
        set({ favorites: favorites.filter((f) => f.url !== stationUrl) });
    },
    isFavorite: (stationUrl) => {
        const { favorites } = get();
        return favorites.some((f) => f.url === stationUrl);
    },

    // Навигация
    currentScreen: 'genre',
    setCurrentScreen: (screen) => set({ currentScreen: screen }),

    // Таймер автосмены
    autoSwitchTimer: null,
    setAutoSwitchTimer: (timer) => set({ autoSwitchTimer: timer }),
}));
