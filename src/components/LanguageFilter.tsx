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
    { id: 'turkish', name: 'Турецкий', flag: '🇹🇷' },
    { id: 'ukrainian', name: 'Украинский', flag: '🇺🇦' },
    { id: 'polish', name: 'Польский', flag: '🇵🇱' },
    { id: 'dutch', name: 'Нидерландский', flag: '🇳🇱' },
    { id: 'swedish', name: 'Шведский', flag: '🇸🇪' },
    { id: 'finnish', name: 'Финский', flag: '🇫🇮' },
    { id: 'greek', name: 'Греческий', flag: '🇬🇷' },
    { id: 'czech', name: 'Чешский', flag: '🇨🇿' },
];

export function LanguageFilter() {
    const { allowedLanguages, setAllowedLanguages, setCurrentScreen } = useStore();
    const [selected, setSelected] = useState<string[]>(allowedLanguages);

    const toggleLanguage = (langId: string) => {
        if (selected.includes(langId)) {
            setSelected(selected.filter((id) => id !== langId));
        } else {
            setSelected([...selected, langId]);
        }
    };

    const handleContinue = () => {
        setAllowedLanguages(selected);
        setCurrentScreen('player');
    };

    const handleSkip = () => {
        // Если пропустили -> значит знают все языки (пустой список = все доступны)
        setAllowedLanguages([]);
        setCurrentScreen('player');
    };

    return (
        <div className="language-filter">
            <div className="language-header">
                <h1>Языки</h1>
                <p>Выберите языки, которые вы понимаете</p>
                <p className="subtitle-small">(Если не выбрать ничего, будут доступны все)</p>
            </div>

            <div className="language-grid">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.id}
                        className={`language-card ${selected.includes(lang.id) ? 'selected' : ''}`}
                        onClick={() => toggleLanguage(lang.id)}
                    >
                        <span className="language-flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
                        {selected.includes(lang.id) && (
                            <span className="check-badge">✓</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="language-actions">
                <button className="btn-secondary" onClick={handleSkip}>
                    Пропустить (все языки)
                </button>
                <button className="btn-primary" onClick={handleContinue}>
                    Продолжить
                </button>
            </div>
        </div>
    );
}
