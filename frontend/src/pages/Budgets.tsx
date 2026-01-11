import { useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    LinearProgress,
    Button,
    linearProgressClasses,
    styled,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.mode === 'light' ? '#e2e8f0' : '#334155',
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
    },
}));

const Budgets = () => {
    const { budgets, isLoading: budgetLoading } = useBudgets();
    const { categories, isLoading: catLoading } = useCategories();

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.EntityType.split('#')[1]] = cat;
            return acc;
        }, {} as Record<string, any>);
    }, [categories]);

    if (budgetLoading || catLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        Budgets
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Set monthly limits and track your spending habits.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                >
                    Create Budget
                </Button>
            </Box>

            <Grid container spacing={3}>
                {budgets.length === 0 && (
                    <Grid item xs={12}>
                        <GlassCard sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary">No budgets found. Plan your spending better by adding one!</Typography>
                        </GlassCard>
                    </Grid>
                )}
                {budgets.map((budget) => {
                    const category = categoryMap[budget.categoryId];
                    // spent calculation would ideally come from backend or be calculated from transactions
                    // for now since it's just a view, I'll show the limit
                    const spent = 0; // TODO: Integrate with transaction sums
                    const percentage = (spent / budget.amount) * 100;
                    const isNearLimit = percentage > 85;

                    return (
                        <Grid item xs={12} md={6} key={budget.EntityType}>
                            <GlassCard>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {category?.name || budget.categoryId}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                                            {budget.period} BUDGET
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            ${spent.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            of ${budget.amount.toLocaleString()} limit
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3, position: 'relative' }}>
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={percentage > 100 ? 100 : percentage}
                                        sx={{
                                            [`& .${linearProgressClasses.bar}`]: {
                                                background: isNearLimit
                                                    ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                                                    : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                            }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="caption" color={isNearLimit ? 'error.main' : 'text.secondary'} fontWeight={700}>
                                            {percentage.toFixed(0)}% Used
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            ${(budget.amount - spent).toLocaleString()} left
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default Budgets;
