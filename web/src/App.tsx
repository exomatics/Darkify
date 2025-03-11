import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/global';
import { Auth } from './pages/Auth';
import { Route, Routes } from 'react-router';
import { Home } from './pages/Home';
import { ProtectedRoutesOutlet } from './routing/ProtectedRoutes';
import { AuthProvider } from './features/auth/AuthProvider';
import { IndexPage } from './pages/Index';
import { Library } from './pages/Library';
import { LikedSongs } from './pages/LikedSongs';
import { Playlists } from './pages/Playlists';
import { Search } from './pages/Search';
import { Discover } from './pages/Discover';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
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
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
