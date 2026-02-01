import { PrismaClient } from '@prisma/client';

// Создаем глобальный экземпляр PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient | undefined;

try {
    if (process.env.DATABASE_URL) {
        prismaInstance = globalForPrisma.prisma || new PrismaClient();
    } else {
        console.warn('⚠️ DATABASE_URL is not set. Database features will be disabled.');
    }
} catch (error) {
    console.error('Failed to initialize Prisma:', error);
}

export const prisma = prismaInstance as PrismaClient;

if (process.env.NODE_ENV !== 'production' && prismaInstance) {
    globalForPrisma.prisma = prismaInstance;
}

export default prisma;

// Типы для совместимости с existинг API
export interface User {
    id: string;
    telegramId: bigint;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Favorite {
    id: string;
    userId: string;
    stationId: string;
    name: string;
    url: string;
    country?: string | null;
    language?: string | null;
    genre?: string | null;
    addedAt: Date;
}

export interface UserSettings {
    id: string;
    userId: string;
    excludedLanguages: string[];
    preferredGenre?: string | null;
    autoPlay: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Получение или создание пользователя
 */
export async function getOrCreateUser(telegramId: number, userData?: {
    username?: string;
    firstName?: string;
    lastName?: string;
}): Promise<User> {
    const user = await prisma.user.upsert({
        where: { telegramId: BigInt(telegramId) },
        update: {
            username: userData?.username,
            firstName: userData?.firstName,
            lastName: userData?.lastName,
        },
        create: {
            telegramId: BigInt(telegramId),
            username: userData?.username,
            firstName: userData?.firstName,
            lastName: userData?.lastName,
        },
    });

    return user as User;
}

/**
 * Получение избранных станций пользователя
 */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
    const favorites = await prisma.favorite.findMany({
        where: { userId },
        orderBy: { addedAt: 'desc' },
    });
    return favorites as Favorite[];
}

/**
 * Добавление станции в избранное
 */
export async function addFavorite(userId: string, station: {
    stationId: string;
    name: string;
    url: string;
    country?: string;
    language?: string;
    genre?: string;
}): Promise<Favorite> {
    const favorite = await prisma.favorite.upsert({
        where: {
            userId_stationId: {
                userId,
                stationId: station.stationId,
            },
        },
        update: {
            name: station.name,
            url: station.url,
            country: station.country,
            language: station.language,
            genre: station.genre,
        },
        create: {
            userId,
            stationId: station.stationId,
            name: station.name,
            url: station.url,
            country: station.country,
            language: station.language,
            genre: station.genre,
        },
    });
    return favorite as Favorite;
}

/**
 * Удаление станции из избранного
 */
export async function removeFavorite(userId: string, stationUrl: string): Promise<void> {
    // Находим станцию по URL и удаляем
    const favorite = await prisma.favorite.findFirst({
        where: { userId, url: stationUrl },
    });

    if (favorite) {
        await prisma.favorite.delete({
            where: { id: favorite.id },
        });
    }
}

/**
 * Получение настроек пользователя
 */
export async function getUserPreferences(userId: string): Promise<UserSettings | null> {
    const settings = await prisma.settings.findUnique({
        where: { userId },
    });
    return settings as UserSettings | null;
}

/**
 * Сохранение настроек пользователя
 */
export async function saveUserPreferences(
    userId: string,
    preferences: {
        preferredGenre?: string;
        excludedLanguages?: string[];
    }
): Promise<UserSettings> {
    const settings = await prisma.settings.upsert({
        where: { userId },
        update: {
            preferredGenre: preferences.preferredGenre,
            excludedLanguages: preferences.excludedLanguages || [],
        },
        create: {
            userId,
            preferredGenre: preferences.preferredGenre,
            excludedLanguages: preferences.excludedLanguages || [],
        },
    });
    return settings as UserSettings;
}
