// Упрощенная версия для тестирования без PostgreSQL
// Использует in-memory хранилище

const users = new Map();
const favorites = new Map();
const preferences = new Map();

let userIdCounter = 1;
let favoriteIdCounter = 1;
let preferenceIdCounter = 1;

export interface User {
    id: number;
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Favorite {
    id: number;
    user_id: number;
    station_name: string;
    station_url: string;
    station_country?: string;
    station_language?: string;
    station_tags?: string[];
    station_favicon?: string;
    station_homepage?: string;
    station_codec?: string;
    station_bitrate?: number;
    created_at: Date;
}

export interface UserPreference {
    id: number;
    user_id: number;
    preferred_genre?: string;
    excluded_languages?: string[];
    created_at: Date;
    updated_at: Date;
}

export async function getOrCreateUser(telegramId: number, userData?: {
    username?: string;
    firstName?: string;
    lastName?: string;
}): Promise<User> {
    // Ищем существующего пользователя
    for (const user of users.values()) {
        if (user.telegram_id === telegramId) {
            return user;
        }
    }

    // Создаем нового
    const newUser: User = {
        id: userIdCounter++,
        telegram_id: telegramId,
        username: userData?.username,
        first_name: userData?.firstName,
        last_name: userData?.lastName,
        created_at: new Date(),
        updated_at: new Date(),
    };

    users.set(newUser.id, newUser);
    return newUser;
}

export async function getUserFavorites(userId: number): Promise<Favorite[]> {
    const userFavorites: Favorite[] = [];

    for (const favorite of favorites.values()) {
        if (favorite.user_id === userId) {
            userFavorites.push(favorite);
        }
    }

    return userFavorites.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function addFavorite(userId: number, station: {
    name: string;
    url: string;
    country?: string;
    language?: string;
    tags?: string[];
    favicon?: string;
    homepage?: string;
    codec?: string;
    bitrate?: number;
}): Promise<Favorite> {
    // Проверяем, нет ли уже такой станции в избранном
    for (const favorite of favorites.values()) {
        if (favorite.user_id === userId && favorite.station_url === station.url) {
            return favorite;
        }
    }

    const newFavorite: Favorite = {
        id: favoriteIdCounter++,
        user_id: userId,
        station_name: station.name,
        station_url: station.url,
        station_country: station.country,
        station_language: station.language,
        station_tags: station.tags,
        station_favicon: station.favicon,
        station_homepage: station.homepage,
        station_codec: station.codec,
        station_bitrate: station.bitrate,
        created_at: new Date(),
    };

    favorites.set(newFavorite.id, newFavorite);
    return newFavorite;
}

export async function removeFavorite(userId: number, stationUrl: string): Promise<void> {
    for (const [id, favorite] of favorites.entries()) {
        if (favorite.user_id === userId && favorite.station_url === stationUrl) {
            favorites.delete(id);
            return;
        }
    }
}

export async function getUserPreferences(userId: number): Promise<UserPreference | null> {
    for (const preference of preferences.values()) {
        if (preference.user_id === userId) {
            return preference;
        }
    }
    return null;
}

export async function saveUserPreferences(
    userId: number,
    prefs: {
        preferredGenre?: string;
        excludedLanguages?: string[];
    }
): Promise<UserPreference> {
    // Ищем существующие настройки
    for (const [id, preference] of preferences.entries()) {
        if (preference.user_id === userId) {
            // Обновляем
            preference.preferred_genre = prefs.preferredGenre;
            preference.excluded_languages = prefs.excludedLanguages;
            preference.updated_at = new Date();
            return preference;
        }
    }

    // Создаем новые
    const newPreference: UserPreference = {
        id: preferenceIdCounter++,
        user_id: userId,
        preferred_genre: prefs.preferredGenre,
        excluded_languages: prefs.excludedLanguages,
        created_at: new Date(),
        updated_at: new Date(),
    };

    preferences.set(newPreference.id, newPreference);
    return newPreference;
}

// Заглушка для совместимости
export default {
    query: async () => ({ rows: [] }),
    connect: async () => ({ release: () => { } }),
};
