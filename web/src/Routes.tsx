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
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const RoutesList = () => {
  const { isInitialized } = useUser();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isInitialized]);

  const appReady = isInitialized && !showSplash;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: appReady ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
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
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: appReady ? 'none' : 'auto',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: appReady ? 0 : 1 }}
        transition={{
          duration: 0.5,
        }}
      >
        <SplashScreen />
      </motion.div>
    </div>
  );
};
