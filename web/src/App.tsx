import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/global';
import { Layout, MainContent } from './styles/layout';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Playbar } from './components/Playbar';
import { FriendsActivity } from './components/FriendsActivity';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Header />
        <Sidebar />
        <MainContent></MainContent>
        <Playbar />
        <FriendsActivity />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
