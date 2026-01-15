import { useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Stack,
    CircularProgress,
    Avatar,
    LinearProgress,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalance as AccountBalanceIcon,
    Receipt as ReceiptIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

// Currency symbol mapping
const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'JPY': '¥',
        'CNY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
    };
    return symbols[currency] || currency;
};

const Dashboard = () => {
    const { accounts, isLoading: accountsLoading } = useAccounts();
    const { transactions, isLoading: transactionsLoading } = useTransactions();
    const { categories } = useCategories();

    // Calculate total balance across all accounts
    const totalBalance = useMemo(() => {
        return accounts.reduce((sum, account) => sum + account.balance, 0);
    }, [accounts]);

    // Get primary currency (from first account or default to INR)
    const primaryCurrency = accounts[0]?.currency || 'INR';
    const currencySymbol = getCurrencySymbol(primaryCurrency);

    // Calculate this month's income and expenses
    const thisMonthStats = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const thisMonthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.transactionDate);
            return txDate >= firstDayOfMonth;
        });

        const income = thisMonthTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = thisMonthTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        return { income, expenses, count: thisMonthTransactions.length };
    }, [transactions]);

    // Top spending categories
    const topCategories = useMemo(() => {
        const categoryTotals: Record<string, number> = {};
        
        transactions
            .filter(tx => tx.type === 'expense')
            .forEach(tx => {
                categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
            });

        const sorted = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return sorted.map(([categoryId, amount]) => {
            const category = categories.find(cat => {
                const catId = cat.EntityType?.split('#')[1];
                return catId === categoryId;
            });
            return {
                categoryId,
                name: category?.name || categoryId,
                icon: category?.icon || '📊',
                color: category?.color || '#6366f1',
                amount,
            };
        });
    }, [transactions, categories]);

    // Recent transactions (last 5)
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
            .slice(0, 5);
    }, [transactions]);

    if (accountsLoading || transactionsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const savingsRate = thisMonthStats.income > 0 
        ? ((thisMonthStats.income - thisMonthStats.expenses) / thisMonthStats.income) * 100 
        : 0;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Your financial overview at a glance
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Balance */}
                <Grid item xs={12} md={4}>
                    <GlassCard sx={{ height: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    TOTAL BALANCE
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 0.5 }}>
                                    {currencySymbol}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}>
                                <AccountBalanceIcon />
                            </Avatar>
                        </Stack>
                    </GlassCard>
                </Grid>

                {/* This Month Income */}
                <Grid item xs={12} md={4}>
                    <GlassCard sx={{ height: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    THIS MONTH INCOME
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 0.5, color: 'success.main' }}>
                                    +{currencySymbol}{thisMonthStats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {thisMonthStats.count} transaction{thisMonthStats.count !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main' }}>
                                <TrendingUpIcon />
                            </Avatar>
                        </Stack>
                    </GlassCard>
                </Grid>

                {/* This Month Expenses */}
                <Grid item xs={12} md={4}>
                    <GlassCard sx={{ height: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    THIS MONTH EXPENSES
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 0.5, color: 'error.main' }}>
                                    -{currencySymbol}{thisMonthStats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Savings rate: {savingsRate.toFixed(1)}%
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main' }}>
                                <TrendingDownIcon />
                            </Avatar>
                        </Stack>
                    </GlassCard>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Top Spending Categories */}
                <Grid item xs={12} md={6}>
                    <GlassCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Top Spending Categories
                            </Typography>
                        </Box>
                        
                        {topCategories.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">No expense data yet</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2.5}>
                                {topCategories.map((cat) => {
                                    const maxAmount = topCategories[0]?.amount || 1;
                                    const percentage = (cat.amount / maxAmount) * 100;
                                    
                                    return (
                                        <Box key={cat.categoryId}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography sx={{ fontSize: '1.2rem' }}>{cat.icon}</Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {cat.name}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {currencySymbol}{cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                            </Stack>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={percentage} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 1,
                                                    bgcolor: `${cat.color}20`,
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: cat.color,
                                                        borderRadius: 1,
                                                    }
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </GlassCard>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12} md={6}>
                    <GlassCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Recent Transactions
                            </Typography>
                        </Box>
                        
                        {recentTransactions.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">No transactions yet</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {recentTransactions.map((tx) => {
                                    const category = categories.find(cat => {
                                        const catId = cat.EntityType?.split('#')[1];
                                        return catId === tx.categoryId;
                                    });
                                    const account = accounts.find(acc => {
                                        const accId = acc.EntityType?.split('#')[1];
                                        return accId === tx.accountId;
                                    });
                                    const txCurrency = getCurrencySymbol(account?.currency || primaryCurrency);

                                    return (
                                        <Stack 
                                            key={tx.EntityType} 
                                            direction="row" 
                                            justifyContent="space-between" 
                                            alignItems="center"
                                            sx={{ 
                                                p: 1.5, 
                                                borderRadius: 2, 
                                                bgcolor: 'rgba(148, 163, 184, 0.05)',
                                                '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.1)' },
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Typography sx={{ fontSize: '1.5rem' }}>
                                                    {category?.icon || '📊'}
                                                </Typography>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {tx.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(tx.transactionDate).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={700}
                                                sx={{ color: tx.type === 'expense' ? 'error.main' : 'success.main' }}
                                            >
                                                {tx.type === 'expense' ? '-' : '+'}{txCurrency}{tx.amount.toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        )}
                    </GlassCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
