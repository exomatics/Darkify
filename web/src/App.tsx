import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/global';
import { AuthProvider } from './features/auth/AuthProvider';
import { RoutesList } from './Routes.tsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <RoutesList />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
