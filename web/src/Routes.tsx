import { Route, Routes } from 'react-router';
import { IndexPage } from './pages/Index';
import { Auth } from './pages/Auth';
import { ProtectedRoutesOutlet } from './routing/ProtectedRoutes.tsx';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { LikedSongs } from './pages/LikedSongs';
import { Playlists } from './pages/Playlists';
import { Search } from './pages/Search';
import { Discover } from './pages/Discover';
import { useUser } from './features/auth/authService.ts';
import { SplashScreen } from './pages/SplashScreen';
import { Profile } from './pages/Profile';

export const RoutesList = () => {
  const { isInitialized } = useUser();

  return (
    <>
      {isInitialized ? (
        <Routes>
          <Route index path="/" element={<IndexPage />} />
          <Route path="/login" element={<Auth />} />
          <Route element={<ProtectedRoutesOutlet />}>
            <Route path="/home" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/liked" element={<LikedSongs />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/search" element={<Search />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      ) : (
        <SplashScreen />
      )}
    </>
  );
};
