import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    getStations,
    getRandomStation,
    registerStationClick,
    getGenres,
    getLanguages,
} from './services/radioService.js';
import {
    getOrCreateUser,
    getUserFavorites,
    addFavorite,
    removeFavorite,
    getUserPreferences,
    saveUserPreferences,
} from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Получение списка станций
app.get('/api/stations', async (req: Request, res: Response) => {
    try {
        const genre = req.query.genre as string | undefined;
        const excludeLanguages = req.query.excludeLanguages
            ? (req.query.excludeLanguages as string).split(',')
            : [];
        const limit = parseInt(req.query.limit as string) || 50;

        const stations = await getStations(genre, excludeLanguages, limit);
        res.json({ success: true, data: stations });
    } catch (error) {
        console.error('Error in /api/stations:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stations' });
    }
});

// Получение случайной станции
app.get('/api/stations/random', async (req: Request, res: Response) => {
    try {
        const genre = req.query.genre as string | undefined;
        const excludeLanguages = req.query.excludeLanguages
            ? (req.query.excludeLanguages as string).split(',')
            : [];

        const station = await getRandomStation(genre, excludeLanguages);

        if (!station) {
            return res.status(404).json({ success: false, error: 'No stations found' });
        }

        res.json({ success: true, data: station });
    } catch (error) {
        console.error('Error in /api/stations/random:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch random station' });
    }
});

// Регистрация клика по станции
app.post('/api/stations/:uuid/click', async (req: Request, res: Response) => {
    try {
        const { uuid } = req.params;
        await registerStationClick(uuid);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in /api/stations/:uuid/click:', error);
        res.status(500).json({ success: false, error: 'Failed to register click' });
    }
});

// Получение списка жанров
app.get('/api/genres', async (req: Request, res: Response) => {
    try {
        const genres = await getGenres();
        res.json({ success: true, data: genres });
    } catch (error) {
        console.error('Error in /api/genres:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch genres' });
    }
});

// Получение списка языков
app.get('/api/languages', async (req: Request, res: Response) => {
    try {
        const languages = await getLanguages();
        res.json({ success: true, data: languages });
    } catch (error) {
        console.error('Error in /api/languages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch languages' });
    }
});

// Получение или создание пользователя
app.post('/api/users', async (req: Request, res: Response) => {
    try {
        const { telegramId, username, firstName, lastName } = req.body;

        if (!telegramId) {
            return res.status(400).json({ success: false, error: 'telegramId is required' });
        }

        const user = await getOrCreateUser(telegramId, {
            username,
            firstName,
            lastName,
        });

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error in /api/users:', error);
        res.status(500).json({ success: false, error: 'Failed to create/get user' });
    }
});

// Получение избранных станций
app.get('/api/users/:telegramId/favorites', async (req: Request, res: Response) => {
    try {
        const telegramId = parseInt(req.params.telegramId);
        const user = await getOrCreateUser(telegramId);
        const favorites = await getUserFavorites(user.id);

        res.json({ success: true, data: favorites });
    } catch (error) {
        console.error('Error in /api/users/:telegramId/favorites:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
    }
});

// Добавление станции в избранное
app.post('/api/users/:telegramId/favorites', async (req: Request, res: Response) => {
    try {
        const telegramId = parseInt(req.params.telegramId);
        const user = await getOrCreateUser(telegramId);

        const station = req.body;
        const favorite = await addFavorite(user.id, station);

        res.json({ success: true, data: favorite });
    } catch (error) {
        console.error('Error in /api/users/:telegramId/favorites:', error);
        res.status(500).json({ success: false, error: 'Failed to add favorite' });
    }
});

// Удаление станции из избранного
app.delete('/api/users/:telegramId/favorites', async (req: Request, res: Response) => {
    try {
        const telegramId = parseInt(req.params.telegramId);
        const { stationUrl } = req.body;

        if (!stationUrl) {
            return res.status(400).json({ success: false, error: 'stationUrl is required' });
        }

        const user = await getOrCreateUser(telegramId);
        await removeFavorite(user.id, stationUrl);

        res.json({ success: true });
    } catch (error) {
        console.error('Error in /api/users/:telegramId/favorites:', error);
        res.status(500).json({ success: false, error: 'Failed to remove favorite' });
    }
});

// Получение настроек пользователя
app.get('/api/users/:telegramId/preferences', async (req: Request, res: Response) => {
    try {
        const telegramId = parseInt(req.params.telegramId);
        const user = await getOrCreateUser(telegramId);
        const preferences = await getUserPreferences(user.id);

        res.json({ success: true, data: preferences });
    } catch (error) {
        console.error('Error in /api/users/:telegramId/preferences:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
    }
});

// Сохранение настроек пользователя
app.post('/api/users/:telegramId/preferences', async (req: Request, res: Response) => {
    try {
        const telegramId = parseInt(req.params.telegramId);
        const user = await getOrCreateUser(telegramId);

        const { preferredGenre, excludedLanguages } = req.body;
        const preferences = await saveUserPreferences(user.id, {
            preferredGenre,
            excludedLanguages,
        });

        res.json({ success: true, data: preferences });
    } catch (error) {
        console.error('Error in /api/users/:telegramId/preferences:', error);
        res.status(500).json({ success: false, error: 'Failed to save preferences' });
    }
});

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📻 AroundFM API ready`);
});
