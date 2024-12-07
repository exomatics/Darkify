import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/global';
import { Layout, PageLayout } from './styles/layout';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Header />
        <Sidebar />
        <PageLayout></PageLayout>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
