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
    const recentReleasedSingles = await dashboard.getRecentReleases(userId);
    const randomAlbums = await dashboard.getRandomAlbums(userId);
    const randomArtists = await dashboard.getRandomArtists();
    const randomPlaylists = await dashboard.getRandomPlaylists();
    const recentlyPlayed = await dashboard.getRecentlyPlayed(userId);
    return {
      recently_released: recentReleasedSingles.data,
      random_albums: randomAlbums.data,
      random_artists: randomArtists.data,
      random_playlists: randomPlaylists.data,
      recently_played: recentlyPlayed.data,
    };
  },
};
