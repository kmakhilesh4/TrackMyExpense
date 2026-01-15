import { useState, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    CssBaseline,
    PaletteMode,
    CircularProgress,
    Box as MuiBox,
    Box,
} from '@mui/material';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { getThemeOptions } from './theme';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Create Theme Context
interface ThemeContextType {
    toggleColorMode: () => void;
    mode: PaletteMode;
}

export const ColorModeContext = createContext<ThemeContextType>({
    toggleColorMode: () => { },
    mode: 'dark',
});

export const useColorMode = () => useContext(ColorModeContext);

// Create a Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <MuiBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </MuiBox>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const DashboardView = () => {
    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
                <h1>Welcome to TrackMyExpense</h1>
                <p>Navigate to Accounts or Transactions to get started.</p>
            </Box>
        </Box>
    );
};

function App() {
    const [mode, setMode] = useState<PaletteMode>('dark');
    
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode],
    );

    const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

    return (
        <QueryClientProvider client={queryClient}>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <AuthProvider>
                            <MainLayout>
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
                                    <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
                                    <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
                                    <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                                    <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
                                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </MainLayout>
                        </AuthProvider>
                    </BrowserRouter>
                    <Toaster position="top-right" />
                </ThemeProvider>
            </ColorModeContext.Provider>
        </QueryClientProvider>
    );
}

export default App;
