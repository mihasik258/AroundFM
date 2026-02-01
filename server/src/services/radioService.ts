import { fallbackStations } from './stations.js';

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

/**
 * Получение списка радиостанций с фильтрацией
 * Использует локальный список станций вместо Radio Browser API
 */
export async function getStations(
    genre?: string,
    excludeLanguages: string[] = [],
    limit: number = 50
): Promise<RadioStation[]> {
    let stations = [...fallbackStations];

    // Фильтр по жанру
    if (genre && genre !== 'any') {
        const genreLower = genre.toLowerCase();
        stations = stations.filter(station =>
            station.tags.some(tag =>
                tag.toLowerCase().includes(genreLower) ||
                genreLower.includes(tag.toLowerCase())
            )
        );
    }

    // Фильтрация по языкам (исключение)
    if (excludeLanguages.length > 0) {
        stations = stations.filter(station => {
            const stationLang = station.language?.toLowerCase() || '';
            return !excludeLanguages.some(lang =>
                stationLang.includes(lang.toLowerCase())
            );
        });
    }

    // Перемешиваем массив для разнообразия
    stations = shuffleArray(stations);

    // Ограничиваем количество
    stations = stations.slice(0, limit);

    return stations;
}

/**
 * Перемешивание массива (алгоритм Фишера-Йейтса)
 */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Получение случайной станции из списка
 */
export async function getRandomStation(
    genre?: string,
    excludeLanguages: string[] = []
): Promise<RadioStation | null> {
    const stations = await getStations(genre, excludeLanguages, 50);

    if (stations.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * stations.length);
    return stations[randomIndex];
}

/**
 * Регистрация клика по станции (заглушка, так как не используем Radio Browser)
 */
export async function registerStationClick(stationUuid: string): Promise<void> {
    // Не делаем ничего, так как используем локальный список
    console.log(`Station click registered locally: ${stationUuid}`);
}

/**
 * Получение списка доступных жанров из локальных станций
 */
export async function getGenres(): Promise<string[]> {
    const allTags = new Set<string>();

    fallbackStations.forEach(station => {
        station.tags.forEach(tag => {
            allTags.add(tag.toLowerCase());
        });
    });

    // Сортируем и возвращаем уникальные теги
    return Array.from(allTags).sort();
}

/**
 * Получение списка языков из локальных станций
 */
export async function getLanguages(): Promise<string[]> {
    const allLanguages = new Set<string>();

    fallbackStations.forEach(station => {
        if (station.language) {
            allLanguages.add(station.language.toLowerCase());
        }
    });

    // Сортируем и возвращаем уникальные языки
    return Array.from(allLanguages).sort();
}
