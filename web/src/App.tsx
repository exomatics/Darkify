import { RoutesList } from './Routes.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoutesList />
    </QueryClientProvider>
  );
}

export default App;
