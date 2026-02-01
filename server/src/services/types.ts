export interface RadioStation {
    name: string;
    url: string;
    homepage: string;
    favicon: string;
    tags: string[];
    country: string;
    language: string;
    codec: string;
    bitrate: number;
    stationuuid?: string;
}
