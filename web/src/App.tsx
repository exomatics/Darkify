import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/global';
import { RoutesList } from './Routes.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <RoutesList />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
