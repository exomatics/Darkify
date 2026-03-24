/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { AlbumService } from './services/AlbumService';
import { ArtistService } from './services/ArtistService';
import { AuthService } from './services/AuthService';
import { DashboardService } from './services/DashboardService';
import { LibraryService } from './services/LibraryService';
import { LikedService } from './services/LikedService';
import { PlaylistService } from './services/PlaylistService';
import { SearchService } from './services/SearchService';
import { SystemService } from './services/SystemService';
import { TrackService } from './services/TrackService';
import { UserService } from './services/UserService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
    public readonly album: AlbumService;
    public readonly artist: ArtistService;
    public readonly auth: AuthService;
    public readonly dashboard: DashboardService;
    public readonly library: LibraryService;
    public readonly liked: LikedService;
    public readonly playlist: PlaylistService;
    public readonly search: SearchService;
    public readonly system: SystemService;
    public readonly track: TrackService;
    public readonly user: UserService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'http://localhost:3000/api',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.album = new AlbumService(this.request);
        this.artist = new ArtistService(this.request);
        this.auth = new AuthService(this.request);
        this.dashboard = new DashboardService(this.request);
        this.library = new LibraryService(this.request);
        this.liked = new LikedService(this.request);
        this.playlist = new PlaylistService(this.request);
        this.search = new SearchService(this.request);
        this.system = new SystemService(this.request);
        this.track = new TrackService(this.request);
        this.user = new UserService(this.request);
    }
}

