import { useStore } from '../store/useStore';
import './GenreSelector.css';

const GENRES = [
    { id: 'any', name: 'Любой жанр', icon: '🌍' },
    { id: 'pop', name: 'Поп', icon: '🎵' },
    { id: 'rock', name: 'Рок', icon: '🎸' },
    { id: 'jazz', name: 'Джаз', icon: '🎷' },
    { id: 'classical', name: 'Классика', icon: '🎻' },
    { id: 'electronic', name: 'Электроника', icon: '🎹' },
    { id: 'hip hop', name: 'Хип-хоп', icon: '🎤' },
    { id: 'talk', name: 'Разговорное', icon: '💬' },
    { id: 'news', name: 'Новости', icon: '📰' },
];

export function GenreSelector() {
    const { selectedGenre, setSelectedGenre, setCurrentScreen } = useStore();

    const handleGenreSelect = (genreId: string) => {
        setSelectedGenre(genreId);
        setCurrentScreen('language');
    };

    return (
        <div className="genre-selector">
            <div className="genre-header">
                <h1>Around FM</h1>
                <p>Выберите желаемый жанр</p>
            </div>

            <div className="genre-grid">
                {GENRES.map((genre) => (
                    <button
                        key={genre.id}
                        className={`genre-card ${selectedGenre === genre.id ? 'selected' : ''}`}
                        onClick={() => handleGenreSelect(genre.id)}
                    >
                        <span className="genre-icon">{genre.icon}</span>
                        <span className="genre-name">{genre.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
