import { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ArrowUpward as ExpenseIcon,
    ArrowDownward as IncomeIcon,
    MoreVert as MoreVertIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import AddTransactionDialog from '../components/common/AddTransactionDialog';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

const Transactions = () => {
    const { transactions, isLoading: txLoading } = useTransactions();
    const { categories } = useCategories();
    const [openDialog, setOpenDialog] = useState(false);

    const categoryMap = useMemo(() => {
        if (!categories || categories.length === 0) return {};
        return categories.reduce((acc, cat) => {
            const categoryId = cat.EntityType?.split('#')[1] || cat.EntityType;
            acc[categoryId] = cat;
            return acc;
        }, {} as Record<string, any>);
    }, [categories]);

    // Show loading only for transactions, not categories
    if (txLoading) {
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
                        Transactions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Detailed history of all your financial activities.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add New
                    </Button>
                </Stack>
            </Box>

            <GlassCard sx={{ mb: 3, p: '16px !important' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="Search transactions..."
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<FilterIcon />}
                        sx={{
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            bgcolor: 'rgba(148, 163, 184, 0.1)',
                            '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.2)' }
                        }}
                    >
                        Filter
                    </Button>
                </Stack>
            </GlassCard>

            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', backgroundImage: 'none' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ '& .MuiTableCell-head': { fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' } }}>
                        <TableRow>
                            <TableCell>TRANSACTION</TableCell>
                            <TableCell>CATEGORY</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell align="right">AMOUNT</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No transactions found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {transactions.map((tx) => {
                            const category = categoryMap[tx.categoryId];
                            return (
                                <TableRow
                                    key={tx.EntityType}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.03)' },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                sx={{
                                                    bgcolor: tx.type === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: tx.type === 'expense' ? 'error.main' : 'success.main',
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                {tx.type === 'expense' ? <ExpenseIcon fontSize="small" /> : <IncomeIcon fontSize="small" />}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {tx.description}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {tx.type.toUpperCase()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={category?.name || tx.categoryId}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                bgcolor: category?.color ? `${category.color}20` : 'rgba(99, 102, 241, 0.1)',
                                                color: category?.color || 'primary.main',
                                                borderRadius: 1
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{new Date(tx.transactionDate).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: tx.type === 'expense' ? 'error.main' : 'success.main' }}>
                                            {tx.type === 'expense' ? '- ' : '+'}${tx.amount.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small">
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddTransactionDialog open={openDialog} onClose={() => setOpenDialog(false)} />
        </Box>
    );
};

export default Transactions;
