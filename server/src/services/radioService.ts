import { RadioStation } from './types.js';
import { fallbackStations } from './stations.js';

/**
 * Получение списка радиостанций с фильтрацией
 * Использует локальный список станций вместо Radio Browser API
 */
export async function getStations(
    genre?: string,
    allowedLanguages: string[] = [],
    limit: number = 50
): Promise<RadioStation[]> {
    let stations = [...fallbackStations];

    // Фильтр по жанрам
    if (genre && genre !== 'any') {
        const genres = genre.toLowerCase().split(',').map(g => g.trim()).filter(g => g);

        if (genres.length > 0) {
            stations = stations.filter(station => {
                const stationTags = station.tags.map(t => t.toLowerCase());
                // Станция подходит, если хотя бы один из выбранных жанров есть в тегах станции
                // Или если тег станции содержит выбранный жанр (частичное совпадение)
                return genres.some(selectedGenre =>
                    stationTags.some(tag => tag.includes(selectedGenre) || selectedGenre.includes(tag))
                );
            });
        }
    }

    // Фильтрация по языкам (известные языки)
    if (allowedLanguages.length > 0) {
        stations = stations.filter(station => {
            // Если язык станции не указан (инструментал), оставляем
            if (!station.language) return true;

            const stationLang = station.language.toLowerCase();
            // Станция подходит, если её язык есть в списке известных
            return allowedLanguages.some(lang =>
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
    allowedLanguages: string[] = []
): Promise<RadioStation | null> {
    const stations = await getStations(genre, allowedLanguages, 50);

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
        station.tags.forEach((tag: string) => {
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
