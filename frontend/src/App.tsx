import { useState, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
    CssBaseline,
    PaletteMode,
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { getThemeOptions } from './theme';
import MainLayout from './components/layout/MainLayout';

// Pages
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';

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

// Since App.tsx has the DashboardDemo, I'll move it to a proper file later or just use it here
// For now, I'll keep the DashboardDemo here but rename it to Dashboard
import {
    Typography,
    Grid,
    Box,
    Button,
    Stack
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import GlassCard from './components/common/GlassCard';
import { useAccounts } from './hooks/useAccounts';
import { useTransactions } from './hooks/useTransactions';

const DashboardView = () => {
    const { accounts, isLoading: accountsLoading } = useAccounts();
    const { transactions, isLoading: transactionsLoading } = useTransactions();

    const stats = useMemo(() => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const monthlyTransactions = transactions.filter(tx => {
            const date = new Date(tx.transactionDate);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });

        const monthlyIncome = monthlyTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const monthlyExpenses = monthlyTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        return { totalBalance, monthlyIncome, monthlyExpenses };
    }, [accounts, transactions]);

    if (accountsLoading || transactionsLoading) {
        return <Typography>Loading dashboard data...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        Welcome back! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here's what's happening with your finances today.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                >
                    Add Transaction
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <GlassCard>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                            TOTAL BALANCE
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                            ${stats.totalBalance.toLocaleString()}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'success.main' }}>
                            <TrendingUpIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={700}>Active accounts: {accounts.length}</Typography>
                        </Stack>
                    </GlassCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <GlassCard sx={{ borderLeft: '4px solid #10b981 !important' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                            MONTHLY INCOME
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                            ${stats.monthlyIncome.toLocaleString()}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'success.main' }}>
                            <TrendingUpIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={700}>This month</Typography>
                        </Stack>
                    </GlassCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <GlassCard sx={{ borderLeft: '4px solid #ef4444 !important' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                            MONTHLY EXPENSES
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                            ${stats.monthlyExpenses.toLocaleString()}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'error.main' }}>
                            <TrendingDownIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={700}>This month</Typography>
                        </Stack>
                    </GlassCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <GlassCard sx={{ borderLeft: '4px solid #f59e0b !important' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                            NET SAVINGS
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                            ${(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'success.main' }}>
                            <TrendingUpIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={700}>Cash flow</Typography>
                        </Stack>
                    </GlassCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <GlassCard sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">
                            Spending Trend Chart Placeholder
                        </Typography>
                    </GlassCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <GlassCard sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">
                            Recent Transactions Placeholder
                        </Typography>
                    </GlassCard>
                </Grid>
            </Grid>
        </Box>
    );
};

function App() {
    const [mode, setMode] = useState<PaletteMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode as PaletteMode) || 'dark';
    });

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const nextMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', nextMode);
                    return nextMode;
                });
            },
            mode,
        }),
        [mode]
    );

    const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

    return (
        <QueryClientProvider client={queryClient}>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<DashboardView />} />
                                <Route path="/accounts" element={<Accounts />} />
                                <Route path="/transactions" element={<Transactions />} />
                                <Route path="/budgets" element={<Budgets />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </MainLayout>
                    </BrowserRouter>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                backdropFilter: 'blur(10px)',
                            }
                        }}
                    />
                </ThemeProvider>
            </ColorModeContext.Provider>
        </QueryClientProvider>
    );
}

export default App;
