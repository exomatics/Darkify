import NotFoundError from '../errors/not-found-error.ts';
import DashboardManager from '../models/services/dashboard.ts';
import UserManager from '../models/services/user.ts';

const user = new UserManager();
const dashboard = new DashboardManager();

export default {
  async getDashboard(userId: string) {
    const isUserExists = await user.getUserById(userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const recentReleasedSingles = await dashboard.getRecentReleases();
    const randomAlbums = await dashboard.getRandomAlbums();
    const randomArtists = await dashboard.getRandomArtists();
    const randomPlaylists = await dashboard.getRandomPlaylists();
    const recentlyPlayed = await dashboard.getRecentlyPlayed(userId);
    return {
      recently_released: recentReleasedSingles,
      random_albums: randomAlbums,
      random_artists: randomArtists,
      random_playlists: randomPlaylists,
      recently_played: recentlyPlayed,
    };
  },
};
