import { useEffect, useState } from 'react';
import {
  init,
  backButton,
  mainButton,
  themeParams,
  viewport,
  miniApp,
  initData
} from '@telegram-apps/sdk-react';
import { useStore } from './store/useStore';
import { GenreSelector } from './components/GenreSelector';
import { LanguageFilter } from './components/LanguageFilter';
import { Player } from './components/Player';
import './App.css';

// Инициализация Telegram SDK
function initTelegramApp() {
  try {
    // Инициализация SDK
    init();

    // Монтируем компоненты
    if (backButton.mount.isAvailable()) {
      backButton.mount();
    }
    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
    }
    if (themeParams.mount.isAvailable()) {
      themeParams.mount();
    }
    if (viewport.mount.isAvailable()) {
      viewport.mount();
      viewport.expand();
    }
    if (miniApp.mount.isAvailable()) {
      miniApp.mount();
      miniApp.ready();
    }

    return true;
  } catch (e) {
    console.log('Telegram SDK not available, running in standalone mode');
    return false;
  }
}

function App() {
  const { currentScreen, setTelegramId, setCurrentScreen } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Инициализация Telegram
    const isTelegram = initTelegramApp();

    if (isTelegram) {
      try {
        // Получаем данные пользователя
        const user = initData.user();
        if (user?.id) {
          setTelegramId(user.id);
        }

        // Применяем тему Telegram
        const params = themeParams.state();
        if (params) {
          document.documentElement.style.setProperty('--tg-theme-bg-color', params.bgColor || '#ffffff');
          document.documentElement.style.setProperty('--tg-theme-text-color', params.textColor || '#000000');
          document.documentElement.style.setProperty('--tg-theme-hint-color', params.hintColor || '#999999');
          document.documentElement.style.setProperty('--tg-theme-link-color', params.linkColor || '#2481cc');
          document.documentElement.style.setProperty('--tg-theme-button-color', params.buttonColor || '#5d5fef');
          document.documentElement.style.setProperty('--tg-theme-button-text-color', params.buttonTextColor || '#ffffff');
        }
      } catch (e) {
        console.log('Could not get Telegram user data');
        setTelegramId(123456789); // Fallback для тестирования
      }
    } else {
      // Standalone режим (не в Telegram)
      setTelegramId(123456789);
    }

    setIsInitialized(true);
  }, [setTelegramId]);

  // Обработка кнопки "Назад"
  useEffect(() => {
    if (!isInitialized) return;

    try {
      if (currentScreen === 'player' || currentScreen === 'language') {
        backButton.show();

        const handleBack = () => {
          if (currentScreen === 'player') {
            setCurrentScreen('language');
          } else if (currentScreen === 'language') {
            setCurrentScreen('genre');
          }
        };

        backButton.onClick(handleBack);

        return () => {
          backButton.offClick(handleBack);
        };
      } else {
        backButton.hide();
      }
    } catch (e) {
      // Telegram SDK не доступен
    }
  }, [currentScreen, isInitialized, setCurrentScreen]);

  if (!isInitialized) {
    return (
      <div className="app loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {currentScreen === 'genre' && <GenreSelector />}
      {currentScreen === 'language' && <LanguageFilter />}
      {currentScreen === 'player' && <Player />}
    </div>
  );
}

export default App;
