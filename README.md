# Around FM - Telegram Mini App

🌍 Радио со всего мира с интерактивным 3D глобусом

## Деплой

### 1. Backend (Railway)

1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект → Deploy from GitHub repo
3. Выберите папку `server`
4. Добавьте PostgreSQL Database (New → Database → PostgreSQL)
5. В Settings → Variables добавьте:
   - `DATABASE_URL` - скопируйте из PostgreSQL сервиса
   - `NODE_ENV` = `production`
6. После деплоя скопируйте URL вашего сервиса (например: `https://aroundfm-production.up.railway.app`)

### 2. Применение миграций

```bash
# Локально с DATABASE_URL от Railway
npx prisma db push
```

### 3. Frontend (Vercel)

1. Зайдите на [vercel.com](https://vercel.com)
2. Import Git Repository → выберите корневую папку проекта
3. В Environment Variables добавьте:
   - `VITE_API_URL` = URL вашего Railway backend
4. Deploy

### 4. Telegram Bot

1. Откройте @BotFather в Telegram
2. `/newbot` - создайте нового бота
3. `/newapp` - создайте Mini App:
   - Web App URL = URL вашего Vercel frontend
4. `/mybots` → Ваш бот → Bot Settings → Menu Button:
   - Укажите URL Mini App

## Локальная разработка

```bash
# Frontend
cd AroundFM
npm install
npm run dev

# Backend (в другом терминале)
cd server
npm install
npm run dev
```

## Структура проекта

```
AroundFM/
├── src/                 # Frontend (React + Vite)
│   ├── components/      # UI компоненты
│   ├── hooks/           # React хуки
│   ├── store/           # Zustand store
│   └── services/        # API клиент
├── server/              # Backend (Express + Prisma)
│   ├── src/
│   │   ├── db/          # Prisma клиент
│   │   └── services/    # Бизнес-логика
│   └── prisma/          # Схема БД
└── vercel.json          # Конфигурация Vercel
```

## Технологии

- **Frontend**: React, TypeScript, Vite, react-globe.gl
- **Backend**: Express, Prisma, PostgreSQL
- **Telegram**: @telegram-apps/sdk-react
- **Деплой**: Vercel, Railway
