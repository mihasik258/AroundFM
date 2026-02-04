import { useEffect, useRef, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';
import { useStore } from '../store/useStore';

// URL для GeoJSON полигонов стран
const COUNTRIES_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// Маппинг названий стран к стандартным именам в GeoJSON
const COUNTRY_NAME_MAP: Record<string, string> = {
    'USA': 'United States of America',
    'United States': 'United States of America',
    'UK': 'United Kingdom',
    'Russia': 'Russian Federation',
    'South Korea': 'Korea, Republic of',
    'Czech Republic': 'Czechia',
    'The Netherlands': 'Netherlands',
};

// Координаты центров стран для маркера
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
    'USA': { lat: 37.09, lng: -95.71 },
    'United States': { lat: 37.09, lng: -95.71 },
    'United States of America': { lat: 37.09, lng: -95.71 },
    'UK': { lat: 51.51, lng: -0.13 },
    'United Kingdom': { lat: 51.51, lng: -0.13 },
    'France': { lat: 46.23, lng: 2.21 },
    'Germany': { lat: 51.17, lng: 10.45 },
    'Netherlands': { lat: 52.13, lng: 5.29 },
    'Belgium': { lat: 50.85, lng: 4.35 },
    'Switzerland': { lat: 46.82, lng: 8.23 },
    'Austria': { lat: 47.52, lng: 14.55 },
    'Italy': { lat: 41.87, lng: 12.57 },
    'Spain': { lat: 40.46, lng: -3.75 },
    'Portugal': { lat: 39.40, lng: -8.22 },
    'Russia': { lat: 61.52, lng: 105.32 },
    'Russian Federation': { lat: 61.52, lng: 105.32 },
    'Japan': { lat: 36.20, lng: 138.25 },
    'Australia': { lat: -25.27, lng: 133.78 },
    'New Zealand': { lat: -40.90, lng: 174.89 },
    'Canada': { lat: 56.13, lng: -106.35 },
    'Brazil': { lat: -14.24, lng: -51.93 },
    'Argentina': { lat: -38.42, lng: -63.62 },
    'Mexico': { lat: 23.63, lng: -102.55 },
    'South Korea': { lat: 35.91, lng: 127.77 },
    'Korea, Republic of': { lat: 35.91, lng: 127.77 },
    'India': { lat: 20.59, lng: 78.96 },
    'China': { lat: 35.86, lng: 104.20 },
    'Ireland': { lat: 53.14, lng: -7.69 },
    'Norway': { lat: 60.47, lng: 8.47 },
    'Sweden': { lat: 60.13, lng: 18.64 },
    'Finland': { lat: 61.92, lng: 25.75 },
    'Denmark': { lat: 56.26, lng: 9.50 },
    'Poland': { lat: 51.92, lng: 19.15 },
    'Mongolia': { lat: 46.86, lng: 103.85 },
    'Ukraine': { lat: 48.38, lng: 31.17 },
    'Greece': { lat: 39.07, lng: 21.82 },
    'Turkey': { lat: 38.96, lng: 35.24 },
    'Czechia': { lat: 49.82, lng: 15.47 },
};

interface GeoFeature {
    properties: { ADMIN: string };
    geometry: object;
}

interface CountryData {
    features: GeoFeature[];
}

export function GlobeComponent() {
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { currentStation } = useStore();

    const [countries, setCountries] = useState<CountryData | null>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

    // Загрузка GeoJSON стран
    useEffect(() => {
        fetch(COUNTRIES_URL)
            .then(res => res.json())
            .then(data => setCountries(data))
            .catch(err => console.error('Failed to load countries:', err));
    }, []);

    // Отслеживание размеров контейнера
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: 300
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Настройка автовращения
    useEffect(() => {
        if (globeRef.current) {
            const controls = globeRef.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }
    }, [countries]);

    // Нормализованное имя страны
    const currentCountryName = useMemo(() => {
        if (!currentStation?.country) return null;
        return COUNTRY_NAME_MAP[currentStation.country] || currentStation.country;
    }, [currentStation?.country]);

    // Данные для маркера текущей страны
    const markerData = useMemo(() => {
        if (!currentStation?.country) return [];

        const coords = COUNTRY_COORDS[currentStation.country] ||
            COUNTRY_COORDS[currentCountryName || ''];

        if (!coords) return [];

        return [{
            lat: coords.lat,
            lng: coords.lng,
            size: 25,
            color: '#f59e0b',
            country: currentStation.country
        }];
    }, [currentStation?.country, currentCountryName]);

    // Цвет полигона страны (Минимализм)
    const getPolygonColor = (obj: object) => {
        const feature = obj as GeoFeature;
        const countryName = feature.properties?.ADMIN;
        const isHighlighted = countryName === currentCountryName;
        // Желтый для выбранной, яркий зеленый для остальных
        return isHighlighted ? '#fcd34d' : 'rgba(74, 222, 128, 0.7)';
    };

    // Цвет границы страны
    const getPolygonStrokeColor = (obj: object) => {
        const feature = obj as GeoFeature;
        const countryName = feature.properties?.ADMIN;
        const isHighlighted = countryName === currentCountryName;
        // Яркая белая граница
        return '#ffffff';
    };

    // Центрирование на текущей стране при смене
    useEffect(() => {
        if (globeRef.current && currentStation?.country) {
            const coords = COUNTRY_COORDS[currentStation.country] ||
                COUNTRY_COORDS[currentCountryName || ''];

            if (coords) {
                globeRef.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 2 }, 1000);
            }
        }
    }, [currentStation?.country, currentCountryName]);

    if (!countries) {
        return (
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '16px',
                    background: 'radial-gradient(circle at 50% 50%, #38bdf8 0%, #0ea5e9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                }}
            >
                Загрузка карты...
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '300px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'radial-gradient(circle at 50% 50%, #f0f9ff 0%, #bae6fd 100%)'
            }}
        >
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}

                // Глобус (Скрываем черный шар, фон - это океан)
                showGlobe={false}
                backgroundColor="rgba(0,0,0,0)"
                showAtmosphere={true}
                atmosphereColor="#7dd3fc"
                atmosphereAltitude={0.15}

                // Полигоны стран
                polygonsData={countries.features}
                polygonCapColor={getPolygonColor}
                polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
                polygonStrokeColor={getPolygonStrokeColor}
                polygonAltitude={(d: any) => {
                    const countryName = d.properties?.ADMIN;
                    return countryName === currentCountryName ? 0.04 : 0.01;
                }}

                // Маркеры (точки)
                pointsData={markerData}
                pointLat="lat"
                pointLng="lng"
                pointColor="color"
                pointAltitude={0.08}
                pointRadius={0.5}

                // Кольца вокруг маркера
                ringsData={markerData}
                ringLat="lat"
                ringLng="lng"
                ringColor={() => '#f59e0b'}
                ringMaxRadius={5}
                ringPropagationSpeed={2}
                ringRepeatPeriod={1000}

                // Настройки
                animateIn={true}
            />
        </div>
    );
}

// Экспорт с именем Globe для совместимости
export { GlobeComponent as Globe };
