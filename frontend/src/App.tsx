import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import StudentListPage from './pages/StudentListPage';
import StudentCreatePage from './pages/StudentCreatePage';
import StudentEditPage from './pages/StudentEditPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/students" replace />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/students/create" element={<StudentCreatePage />} />
            <Route path="/students/:id/edit" element={<StudentEditPage />} />
            <Route path="*" element={<Navigate to="/students" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}