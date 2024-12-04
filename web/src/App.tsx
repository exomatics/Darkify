import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/global';
import { Layout } from './styles/layout';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Sidebar />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
