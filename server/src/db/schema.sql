-- Создание базы данных для AroundFM

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица избранных станций
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  station_name VARCHAR(255) NOT NULL,
  station_url TEXT NOT NULL,
  station_country VARCHAR(100),
  station_language VARCHAR(100),
  station_tags TEXT[],
  station_favicon TEXT,
  station_homepage TEXT,
  station_codec VARCHAR(50),
  station_bitrate INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, station_url)
);

-- Таблица настроек пользователя
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_genre VARCHAR(100),
  excluded_languages TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
