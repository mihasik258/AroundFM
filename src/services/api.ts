import axios from 'axios';
import type { RadioStation } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Станции
export async function fetchStations(
    genre?: string,
    excludeLanguages: string[] = [],
    limit: number = 50
): Promise<RadioStation[]> {
    const params: any = { limit };
    if (genre && genre !== 'any') {
        params.genre = genre;
    }
    if (excludeLanguages.length > 0) {
        params.excludeLanguages = excludeLanguages.join(',');
    }

    const response = await api.get('/api/stations', { params });
    return response.data.data;
}

export async function fetchRandomStation(
    genre?: string,
    excludeLanguages: string[] = []
): Promise<RadioStation> {
    const params: any = {};
    if (genre && genre !== 'any') {
        params.genre = genre;
    }
    if (excludeLanguages.length > 0) {
        params.excludeLanguages = excludeLanguages.join(',');
    }

    const response = await api.get('/api/stations/random', { params });
    return response.data.data;
}

export async function registerStationClick(uuid: string): Promise<void> {
    await api.post(`/api/stations/${uuid}/click`);
}

// Жанры и языки
export async function fetchGenres(): Promise<string[]> {
    const response = await api.get('/api/genres');
    return response.data.data;
}

export async function fetchLanguages(): Promise<string[]> {
    const response = await api.get('/api/languages');
    return response.data.data;
}

// Пользователи
export async function createOrGetUser(telegramId: number, userData?: {
    username?: string;
    firstName?: string;
    lastName?: string;
}): Promise<any> {
    const response = await api.post('/api/users', {
        telegramId,
        ...userData,
    });
    return response.data.data;
}

// Избранное
export async function fetchFavorites(telegramId: number): Promise<RadioStation[]> {
    const response = await api.get(`/api/users/${telegramId}/favorites`);
    return response.data.data;
}

export async function addFavorite(telegramId: number, station: RadioStation): Promise<void> {
    await api.post(`/api/users/${telegramId}/favorites`, station);
}

export async function removeFavorite(telegramId: number, stationUrl: string): Promise<void> {
    await api.delete(`/api/users/${telegramId}/favorites`, {
        data: { stationUrl },
    });
}

// Настройки
export async function fetchUserPreferences(telegramId: number): Promise<any> {
    const response = await api.get(`/api/users/${telegramId}/preferences`);
    return response.data.data;
}

export async function saveUserPreferences(
    telegramId: number,
    preferences: {
        preferredGenre?: string;
        excludedLanguages?: string[];
    }
): Promise<void> {
    await api.post(`/api/users/${telegramId}/preferences`, preferences);
}
