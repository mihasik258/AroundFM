import { useState } from 'react';
import { useStore } from '../store/useStore';
import './LanguageFilter.css';

const LANGUAGES = [
    { id: 'english', name: 'Английский', flag: '🇬🇧' },
    { id: 'spanish', name: 'Испанский', flag: '🇪🇸' },
    { id: 'french', name: 'Французский', flag: '🇫🇷' },
    { id: 'german', name: 'Немецкий', flag: '🇩🇪' },
    { id: 'italian', name: 'Итальянский', flag: '🇮🇹' },
    { id: 'portuguese', name: 'Португальский', flag: '🇵🇹' },
    { id: 'russian', name: 'Русский', flag: '🇷🇺' },
    { id: 'chinese', name: 'Китайский', flag: '🇨🇳' },
    { id: 'japanese', name: 'Японский', flag: '🇯🇵' },
    { id: 'korean', name: 'Корейский', flag: '🇰🇷' },
    { id: 'arabic', name: 'Арабский', flag: '🇸🇦' },
    { id: 'hindi', name: 'Хинди', flag: '🇮🇳' },
];

export function LanguageFilter() {
    const { excludedLanguages, setExcludedLanguages, setCurrentScreen } = useStore();
    const [selected, setSelected] = useState<string[]>(excludedLanguages);

    const toggleLanguage = (langId: string) => {
        if (selected.includes(langId)) {
            setSelected(selected.filter((id) => id !== langId));
        } else {
            setSelected([...selected, langId]);
        }
    };

    const handleContinue = () => {
        setExcludedLanguages(selected);
        setCurrentScreen('player');
    };

    const handleSkip = () => {
        setExcludedLanguages([]);
        setCurrentScreen('player');
    };

    return (
        <div className="language-filter">
            <div className="language-header">
                <h1>Фильтр языков</h1>
                <p>Выберите языки, которые НЕ должны попадаться</p>
            </div>

            <div className="language-grid">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.id}
                        className={`language-card ${selected.includes(lang.id) ? 'excluded' : ''}`}
                        onClick={() => toggleLanguage(lang.id)}
                    >
                        <span className="language-flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
                        {selected.includes(lang.id) && (
                            <span className="excluded-badge">✕</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="language-actions">
                <button className="btn-secondary" onClick={handleSkip}>
                    Все языки подходят
                </button>
                <button className="btn-primary" onClick={handleContinue}>
                    Продолжить
                </button>
            </div>
        </div>
    );
}
